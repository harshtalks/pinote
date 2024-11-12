// Creating router for Two Factor Auth Calls

import { authenticatedProcedure, createTRPCRouter } from "@/trpc/trpc";
import { asEither, failwithTrpcErr, inputAsSchema } from "@/trpc/utils.trpc";
import { TrpcCustomError } from "@/utils/errors";
import { decodeBase64 } from "@oslojs/encoding";
import { TRPCError } from "@trpc/server";
import { Effect, Schema } from "effect";
import {
  decodePKIXECDSASignature,
  decodeSEC1PublicKey,
  ECDSAPublicKey,
  p256,
  verifyECDSASignature,
} from "@oslojs/crypto/ecdsa";
import {
  decodePKCS1RSAPublicKey,
  RSAPublicKey,
  sha256ObjectIdentifier,
  verifyRSASSAPKCS1v15Signature,
} from "@oslojs/crypto/rsa";
import {
  AttestationStatementFormat,
  ClientDataType,
  coseAlgorithmES256,
  coseAlgorithmRS256,
  coseEllipticCurveP256,
  createAssertionSignatureMessage,
  parseAttestationObject,
  parseAuthenticatorData,
  parseClientDataJSON,
} from "@oslojs/webauthn";
import {
  provideChallengeRef,
  TfChallenges,
} from "@/auth/two-factor/challenge.ref";
import { AuthenticatorInsert } from "@/db/schema/*";
import { bufferToUint8Array, uint8ArrayToBuffer } from "@/utils/casting";
import { authenticatorRepo, sessionRepo, userMetaRepo } from "@/repositories/*";
import { Branded } from "@/types/*";
import { provideDB } from "@/db/*";
import { trpcRunTime } from "@/trpc/layer/*";
import { sha256 } from "@oslojs/crypto/sha2";

export const tfRouter = createTRPCRouter({
  // Registering a new two factor auth device
  register: authenticatedProcedure
    .input(
      inputAsSchema(
        Schema.Struct({
          name: Schema.String,
          attestationObject: Schema.String,
          clientDataJSON: Schema.String,
        }),
      ),
    )
    .mutation(({ ctx, input }) =>
      Effect.gen(function* () {
        // get user session
        const { session, user } = yield* ctx.session;

        if (!user.twoFactorAuth) {
          return yield* Effect.fail(
            new TrpcCustomError({
              error: new TRPCError({
                code: "FORBIDDEN",
                message:
                  "You need to have two factor auth enabled in order to use this.",
              }),
            }),
          );
        }

        const attestationObjectBytes = decodeBase64(input.attestationObject);
        const clientDataJSON = decodeBase64(input.clientDataJSON);

        // do something with the attestationObject and clientDataJSON
        const attestationObject = parseAttestationObject(
          attestationObjectBytes,
        );
        const attestationStatement = attestationObject.attestationStatement;
        const authenticatorData = attestationObject.authenticatorData;

        if (attestationStatement.format !== AttestationStatementFormat.None) {
          return yield* failwithTrpcErr(
            new TRPCError({
              code: "BAD_REQUEST",
              message: "Something went wrong, please try again later.",
            }),
          );
        }

        if (!authenticatorData.verifyRelyingPartyIdHash("localhost")) {
          return yield* failwithTrpcErr(
            new TRPCError({
              code: "BAD_REQUEST",
              message: "Something went wrong, please try again later.",
            }),
          );
        }

        if (!authenticatorData.userPresent || !authenticatorData.userVerified) {
          return yield* failwithTrpcErr(
            new TRPCError({
              code: "BAD_REQUEST",
              message: "Something went wrong, please try again later.",
            }),
          );
        }

        if (!authenticatorData.credential) {
          return yield* failwithTrpcErr(
            new TRPCError({
              code: "BAD_REQUEST",
              message: "Could not find attached credentials.",
            }),
          );
        }

        const clientData = parseClientDataJSON(clientDataJSON);

        // do something with the clientData
        if (clientData.type !== ClientDataType.Create) {
          return yield* failwithTrpcErr(
            new TRPCError({
              code: "BAD_REQUEST",
              message: "Something went wrong, please try again later.",
            }),
          );
        }

        // do something with the user
        const challenge = yield* TfChallenges;
        const verifiedChallenge = yield* challenge.validateChallenge(
          clientData.challenge,
        );

        if (!verifiedChallenge) {
          return yield* failwithTrpcErr(
            new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid challenge",
            }),
          );
        }

        if (clientData.origin !== "http://localhost:3000") {
          return yield* failwithTrpcErr(
            new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid origin",
            }),
          );
        }

        if (clientData.crossOrigin) {
          return yield* failwithTrpcErr(
            new TRPCError({
              code: "BAD_REQUEST",
              message: "Cross origin request",
            }),
          );
        }

        const credential = yield* Effect.gen(function* () {
          if (!authenticatorData.credential) {
            return yield* failwithTrpcErr(
              new TRPCError({
                code: "BAD_REQUEST",
                message: "Could not find attached credentials.",
              }),
            );
          }

          if (
            authenticatorData.credential.publicKey.algorithm() ===
            coseAlgorithmES256
          ) {
            const cosePublicKey = authenticatorData.credential.publicKey.ec2();

            if (cosePublicKey.curve !== coseEllipticCurveP256) {
              return yield* failwithTrpcErr(
                new TRPCError({
                  code: "BAD_REQUEST",
                  message: "Invalid curve",
                }),
              );
            }

            const encodedPublicKey = new ECDSAPublicKey(
              p256,
              cosePublicKey.x,
              cosePublicKey.y,
            ).encodeSEC1Uncompressed();

            return {
              id: uint8ArrayToBuffer(authenticatorData.credential.id),
              userId: user.id,
              name: input.name,
              algorithm: coseAlgorithmES256,
              credentialPublicKey: uint8ArrayToBuffer(encodedPublicKey),
            } as AuthenticatorInsert;
          } else if (
            authenticatorData.credential.publicKey.algorithm() ===
            coseAlgorithmRS256
          ) {
            const cosePublicKey = authenticatorData.credential.publicKey.rsa();

            const encodedPublicKey = new RSAPublicKey(
              cosePublicKey.n,
              cosePublicKey.e,
            ).encodePKCS1();

            return {
              id: uint8ArrayToBuffer(authenticatorData.credential.id),
              userId: user.id,
              name: input.name,
              algorithm: coseAlgorithmRS256,
              credentialPublicKey: uint8ArrayToBuffer(encodedPublicKey),
            } as AuthenticatorInsert;
          } else {
            return yield* failwithTrpcErr(
              new TRPCError({
                code: "BAD_REQUEST",
                message: "Invalid algorithm",
              }),
            );
          }
        });

        const userCredentials = yield* authenticatorRepo.getUserAuthenticators(
          Branded.UserId(user.id),
        );

        if (userCredentials.length > 5) {
          return yield* failwithTrpcErr(
            new TRPCError({
              code: "BAD_REQUEST",
              message: "You can only have 5 authenticators",
            }),
          );
        }

        yield* authenticatorRepo.createNewAuthenticator(credential);

        if (!session.tfVerified) {
          yield* sessionRepo.setSessionTFStatus(Branded.SessionId(session.id))(
            true,
          );
        }

        return {
          success: true,
          message: "Successfully registered authenticator",
          recoveryCode: yield* userMetaRepo.getUserMetaRecoveryCode(
            Branded.UserId(user.id),
          ),
        };
      }).pipe(provideDB, provideChallengeRef, asEither, trpcRunTime.runPromise),
    ),
  // Get the status of the user's two factor auth
  tfStatus: authenticatedProcedure.query(({ ctx }) =>
    ctx.session.pipe(
      Effect.map(({ user: { twoFactorAuth } }) => twoFactorAuth),
      asEither,
      provideDB,
      trpcRunTime.runPromise,
    ),
  ),
  // Verify the user's two factor auth
  tfVerify: authenticatedProcedure
    .input(
      inputAsSchema(
        Schema.Struct({
          credentialId: Schema.String,
          signature: Schema.String,
          authenticatorData: Schema.String,
          clientDataJSON: Schema.String,
        }),
      ),
    )
    .mutation(({ ctx, input }) =>
      Effect.gen(function* () {
        const { session, user } = yield* ctx.session;

        if (!user.twoFactorAuth) {
          return yield* failwithTrpcErr(
            new TRPCError({
              code: "BAD_REQUEST",
              message: "Two factor auth is not enabled",
            }),
          );
        }

        const authenticatorDataBytes = decodeBase64(input.authenticatorData);
        const clientDataJSON = decodeBase64(input.clientDataJSON);
        const credentialId = decodeBase64(input.credentialId);
        const signatureBytes = decodeBase64(input.signature);

        const authenticatorData = parseAuthenticatorData(
          authenticatorDataBytes,
        );

        if (!authenticatorData.verifyRelyingPartyIdHash("localhost")) {
          return yield* failwithTrpcErr(
            new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid relying party id hash",
            }),
          );
        }

        if (!authenticatorData.userPresent) {
          return yield* failwithTrpcErr(
            new TRPCError({
              code: "BAD_REQUEST",
              message: "User not present",
            }),
          );
        }

        const clientData = parseClientDataJSON(clientDataJSON);

        if (clientData.type !== ClientDataType.Get) {
          return yield* failwithTrpcErr(
            new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid client data type",
            }),
          );
        }

        const challenges = yield* TfChallenges;
        const isChallengeValid = yield* challenges.validateChallenge(
          clientData.challenge,
        );

        if (!isChallengeValid) {
          return yield* failwithTrpcErr(
            new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid challenge",
            }),
          );
        }

        if (clientData.origin !== "http://localhost:3000") {
          return yield* failwithTrpcErr(
            new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid origin",
            }),
          );
        }

        if (clientData.crossOrigin) {
          return yield* failwithTrpcErr(
            new TRPCError({
              code: "BAD_REQUEST",
              message: "Cross origin request",
            }),
          );
        }

        const authenticator = yield* authenticatorRepo.getUserAuthenticator(
          Branded.UserId(user.id),
        )(credentialId);

        const isValidSignature = yield* Effect.gen(function* () {
          if (authenticator.algorithm === coseAlgorithmES256) {
            const ecdsaSignature = decodePKIXECDSASignature(signatureBytes);
            const ecdsaPublicKey = decodeSEC1PublicKey(
              p256,
              bufferToUint8Array(authenticator.credentialPublicKey),
            );
            const hash = sha256(
              createAssertionSignatureMessage(
                authenticatorDataBytes,
                clientDataJSON,
              ),
            );

            return verifyECDSASignature(ecdsaPublicKey, hash, ecdsaSignature);
          } else if (authenticator.algorithm === coseAlgorithmRS256) {
            const rsaPublicKey = decodePKCS1RSAPublicKey(
              bufferToUint8Array(authenticator.credentialPublicKey),
            );
            const hash = sha256(
              createAssertionSignatureMessage(
                authenticatorDataBytes,
                clientDataJSON,
              ),
            );
            return verifyRSASSAPKCS1v15Signature(
              rsaPublicKey,
              sha256ObjectIdentifier,
              hash,
              signatureBytes,
            );
          } else {
            return yield* failwithTrpcErr(
              new TRPCError({
                code: "BAD_REQUEST",
                message: "Invalid algorithm",
              }),
            );
          }
        });

        if (!isValidSignature) {
          return yield* failwithTrpcErr(
            new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid signature",
            }),
          );
        }

        yield* sessionRepo.setSessionTFStatus(Branded.SessionId(session.id))(
          true,
        );

        return {
          success: true,
          message: "Successfully verified two factor auth",
        };
      }),
    ),
});

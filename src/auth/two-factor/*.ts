// Everything related to two factor authentication using - passkey
// Highly recommended to use this feature for security purposes

export * from "./recovery";
export * from "./challenge.ref";
export * from "./reset-tf";

// Comments
// 1. Each session would have a tfVerified flag, which would be set to true if the user has verified the two factor authentication.
// 2. By default the tfVerified flag would be set to false.
// 3. User has a flag called tfEnabled, which would be set to true if the user has enabled the two factor authentication.
// 4. To check if the user has any authenticators, we can check the length of the authenticators array.
// 5. When the user enables the two factor authentication, the tfEnabled flag would be set to true.
// 6. When the user disables the two factor authentication, the tfEnabled flag would be set to false.
// 7. When the user has enabled the flag -> takr them to the two factor authentication page.
// 8. If the length of the authenticators array is 0, then the user has not enabled the two factor authentication. Take them to the two factor registration page.
// 9. Once the user has registered the two factor authentication, The current session would have a tfVerified flag set to true.
// 10. When the user logs out and logs in again, the user would be taken to the two factor authentication page.
// 11. User would not be able to access the dashboard until the two factor authentication is verified.

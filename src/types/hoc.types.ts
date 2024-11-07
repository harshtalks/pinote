import { NextRequest, NextResponse } from "next/server";

// next handler signature
export type NextHandler<TBody = unknown> = (
  req: NextRequest,
  { params }: { params: Record<string, string | undefined> },
) => Promise<NextResponse<TBody>>;

export type ResponseSuccess<TData> = {
  success: true;
  result: TData;
};

export type ResponseError = {
  success: false;
  error: string;
};

export type ErrorWrapperResponse<TData = unknown> =
  | ResponseSuccess<TData>
  | ResponseError;

export type StringResponseType = ErrorWrapperResponse<string>;

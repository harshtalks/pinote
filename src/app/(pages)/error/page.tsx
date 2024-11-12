import { RouteProps, withTypedParams } from "@/hoc/with-typed-params.hoc";
import ErrorPageRoute from "./route.info";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ErrorPage = async (routeProps: RouteProps) => {
  return (
    await withTypedParams(ErrorPageRoute)(routeProps)(
      ({ parsedSearchParams }) => (
        <div className="grid h-screen place-content-center bg-white px-4">
          <div className="text-center">
            <h1 className="text-9xl font-black text-gray-200">
              {parsedSearchParams.code ?? "404"}
            </h1>

            <p className="text-2xl font-cal font-bold tracking-tight text-gray-900 sm:text-4xl">
              Uh-oh!
            </p>

            <p className="mt-4 mb-4 text-gray-500">
              {parsedSearchParams.message ??
                "We couldn't find the page you were looking for."}
            </p>

            <Link href={parsedSearchParams.goBackTo ?? "/"}>
              <Button>Go Back</Button>
            </Link>
          </div>
        </div>
      ),
    )
  )({});
};

export default ErrorPage;

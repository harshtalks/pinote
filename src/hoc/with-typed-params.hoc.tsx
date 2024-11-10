import type { ComponentType } from "react";
import type { Tempeh } from "tempeh";
import type { output, ZodSchema } from "zod";

export type RouteProps = {
  params: Promise<unknown>;
  searchParams: Promise<unknown>;
};

// Use it on page level, async to support next.js 15
export const withTypedParams =
  <TParams extends ZodSchema, TSearchParams extends ZodSchema>(
    routeInfo: Tempeh.RouteConfig<TParams, TSearchParams>,
  ) =>
  ({ params, searchParams }: RouteProps) =>
  async <TProps extends object>(
    MyComponent: React.ComponentType<
      TProps & {
        parsedParams: output<TParams>;
        parsedSearchParams: output<TSearchParams>;
      }
    >,
  ) => {
    const parsedParams = await params.then((awaitedParams) =>
      routeInfo.parseParams(awaitedParams),
    );
    const parsedSearchParams = await searchParams.then((awaitedSearchParams) =>
      routeInfo.parseSearchParams(awaitedSearchParams),
    );

    const ComponentWithParsedInfo: ComponentType<TProps> = (rest: TProps) => {
      return (
        <MyComponent
          {...rest}
          parsedSearchParams={parsedSearchParams}
          parsedParams={parsedParams}
        />
      );
    };

    ComponentWithParsedInfo.displayName = `withTypedRoutes(${
      MyComponent.displayName || MyComponent.name || "Component"
    })`;

    return ComponentWithParsedInfo;
  };

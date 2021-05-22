open Belt
open ReScriptUrql

type pageData = {
  pageNum: int,
  pageSize: int,
}

type filterState = {
  current: AsteroidFilters.t,
  applied: AsteroidFilters.t,
}

let useFilters = defaultFilters =>
  React.useState(() => {
    current: defaultFilters,
    applied: defaultFilters,
  })

let useInitialRouteEffect = (~pageNum, ~pageSize, ~sort, ~appliedFilters) =>
  React.useEffect4(() => {
    let initialSortField: AsteroidTable.Column.id = #id
    switch (pageNum, pageSize, sort) {
    | (Some(_), Some(_), Some(_)) => ()
    | _ =>
      Route.Asteroids({
        pageNum: pageNum->Option.getWithDefault(1)->Some,
        pageSize: pageSize->Option.getWithDefault(15)->Some,
        sort: sort
        ->Option.getWithDefault({
          QueryParams.field: (initialSortField :> string),
          mode: QueryParams.SortMode.Ascending,
        })
        ->Some,
        filters: Some({
          owned: appliedFilters.AsteroidFilters.owned->AsteroidFilters.Filter.toOption,
          radius: appliedFilters.radius->AsteroidFilters.Filter.toOption,
          spectralTypes: appliedFilters.spectralTypes->AsteroidFilters.Filter.toOption,
        }),
      })
      ->Route.update
      ->ignore
    }
    None
  }, (pageNum, pageSize, sort, appliedFilters))

let useRouteUpdateEffect = (~pageData, ~sortData, ~filters) => React.useEffect3(() => {
    let filters = filters->AsteroidFilters.toQueryParamFilter
    Route.Asteroids({
      pageNum: pageData.pageNum->Some,
      pageSize: pageData.pageSize->Some,
      sort: sortData->Some,
      filters: Some(filters),
    })
    ->Route.update
    ->ignore
    None
  }, (pageData, sortData, filters))

let usePageData = (~pageNum, ~pageSize) =>
  React.useState(() => {
    pageNum: pageNum,
    pageSize: pageSize,
  })

let useAsteroidPageQuery = (
  ~sortData: QueryParams.SortingParamType.t,
  ~pageData,
  ~filters: PageQueryParams.AsteroidPageParamType.filters,
) => {
  let gqlSortingMode = switch sortData.mode {
  | QueryParams.SortMode.Ascending => #ASCENDING
  | QueryParams.SortMode.Descending => #DESCENDING
  }
  let gqlSortingField = switch sortData.field {
  | "id" => #ID
  | "name" => #NAME
  | "owner" => #OWNER
  | "radius" => #RADIUS
  | "surfaceArea" => #SURFACE_AREA
  | "orbitalPeriod" => #ORBITAL_PERIOD
  | "semiMajorAxis" => #SEMI_MAJOR_AXIS
  | "inclination" => #INCLINATION
  | "spectralType" => #SPECTRAL_TYPE
  | _ => #ID
  }
  let ({Hooks.response: response}, _) = Hooks.useQuery(
    ~query=module(Queries.DataTableAsteroids),
    {
      page: {
        num: pageData.pageNum,
        size: pageData.pageSize,
      },
      sort: {
        field: gqlSortingField,
        mode: gqlSortingMode,
      },
      filter: {
        owned: filters.owned,
        spectralTypes: filters.spectralTypes,
        radius: filters.radius->Option.map(((from, to_)) => {
          Queries.DataTableAsteroids.from: from,
          to_: to_,
        }),
      },
    },
  )
  response
}
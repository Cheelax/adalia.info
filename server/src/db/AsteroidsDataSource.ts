import { MongoDataSource } from 'apollo-datasource-mongodb'
import { Collection } from 'mongodb'
import {
  Asteroid,
  AsteroidCount,
  AsteroidField,
  AsteroidFilterInput,
  AsteroidPage,
  AsteroidSortingInput,
  Maybe,
  PageInput,
  RangeInput,
  SortingMode,
  SpectralType,
} from '../types'

const fieldToSortName = (field: AsteroidField): keyof Asteroid => {
  switch (field) {
    case AsteroidField.Id:
      return 'id'
    case AsteroidField.Inclination:
      return 'inclination'
    case AsteroidField.Name:
      return 'name'
    case AsteroidField.OrbitalPeriod:
      return 'orbitalPeriod'
    case AsteroidField.Owner:
      return 'owner'
    case AsteroidField.Radius:
      return 'radius'
    case AsteroidField.SemiMajorAxis:
      return 'semiMajorAxis'
    case AsteroidField.SpectralType:
      return 'spectralType'
    case AsteroidField.SurfaceArea:
      return 'surfaceArea'
    case AsteroidField.Eccentricity:
      return 'eccentricity'
  }
}

const createSortParam = (sorting: AsteroidSortingInput) => {
  const sortName = fieldToSortName(sorting.field)
  const idSortName = fieldToSortName(AsteroidField.Id)
  const mode = sorting.mode == SortingMode.Ascending ? 1 : -1
  return {
    [sortName]: mode,
    [idSortName]: mode,
  }
}

const ownedFilter = (owned: boolean) => ({
  owner: {
    [owned ? '$ne' : '$eq']: null,
  },
})

const spectralTypesFilter = (spectralTypes: SpectralType[]) => ({
  spectralType: { $in: spectralTypes },
})

const rangeFilter = (range: RangeInput, fieldName: keyof Asteroid) => ({
  [fieldName]: {
    $gte: range.from,
    $lte: range.to,
  },
})

const filterToQuery = (filter: AsteroidFilterInput) => {
  const owned = filter.owned == null ? {} : ownedFilter(filter.owned)
  const spectralTypes = filter.spectralTypes
    ? spectralTypesFilter([...filter.spectralTypes])
    : {}
  const radius = filter.radius ? rangeFilter(filter.radius, 'radius') : {}
  const surface = filter.surfaceArea
    ? rangeFilter(filter.surfaceArea, 'surfaceArea')
    : {}
  const orbitalPeriod = filter.orbitalPeriod
    ? rangeFilter(filter.orbitalPeriod, 'orbitalPeriod')
    : {}
  const semiMajorAxis = filter.semiMajorAxis
    ? rangeFilter(filter.semiMajorAxis, 'semiMajorAxis')
    : {}
  const inclination = filter.inclination
    ? rangeFilter(filter.inclination, 'inclination')
    : {}
  const eccentricity = filter.eccentricity
    ? rangeFilter(filter.eccentricity, 'eccentricity')
    : {}

  return {
    $and: [
      owned,
      spectralTypes,
      radius,
      surface,
      orbitalPeriod,
      semiMajorAxis,
      inclination,
      eccentricity,
    ],
  }
}

export default class AsteroidsDataSource extends MongoDataSource<Asteroid> {
  constructor(collection: Collection<Asteroid>) {
    super(collection)
  }

  public async getPage(
    page: PageInput,
    sorting: Maybe<AsteroidSortingInput>,
    filter: Maybe<AsteroidFilterInput>
  ): Promise<AsteroidPage> {
    const offset = (page.num - 1) * page.size
    const sortParam = sorting != null ? createSortParam(sorting) : {}
    const query = filter ? filterToQuery(filter) : {}

    const cursor = this.collection
      .find(query)
      .sort(sortParam)
      .skip(offset)
      .limit(page.size)

    const totalRows = await cursor.count()
    const rows = await cursor.toArray()

    return { rows, totalRows }
  }

  public async count(
    filter: Maybe<AsteroidFilterInput>
  ): Promise<AsteroidCount> {
    const total = await this.collection.countDocuments()
    const count = filter
      ? await this.collection.countDocuments(filterToQuery(filter))
      : total

    return {
      count,
      total,
    }
  }
}

import { Asteroid, AsteroidSize, SpectralType } from '../types'
import {
  KeplerianOrbit,
  OrbitalElements,
  Size,
  SpectralType as ApiSpectralType,
  toSize,
  toSpectralType,
} from 'influence-utils'

export interface ApiAsteroid {
  name?: string
  baseName: string
  i: number
  orbital: OrbitalElements
  r: number
  spectralType: number
  owner?: string
  rawBonuses?: number
  scanned?: boolean
}

const convertSize = (apiSize: Size) => {
  switch (apiSize) {
    case Size.Small:
      return AsteroidSize.Small
    case Size.Medium:
      return AsteroidSize.Medium
    case Size.Large:
      return AsteroidSize.Large
    case Size.Huge:
      return AsteroidSize.Huge
  }
}

const convertSpectralType = (apiType: ApiSpectralType) => {
  switch (apiType) {
    case ApiSpectralType.C:
      return SpectralType.C
    case ApiSpectralType.Ci:
      return SpectralType.Ci
    case ApiSpectralType.Cis:
      return SpectralType.Cis
    case ApiSpectralType.Cm:
      return SpectralType.Cm
    case ApiSpectralType.Cms:
      return SpectralType.Cms
    case ApiSpectralType.Cs:
      return SpectralType.Cs
    case ApiSpectralType.Si:
      return SpectralType.Si
    case ApiSpectralType.Sm:
      return SpectralType.Sm
    case ApiSpectralType.S:
      return SpectralType.S
    case ApiSpectralType.M:
      return SpectralType.M
    case ApiSpectralType.I:
      return SpectralType.I
  }
}

export const convertApiAsteroidToInternal = (
  apiAsteroid: ApiAsteroid
): Asteroid => {
  const orbit = new KeplerianOrbit(apiAsteroid.orbital)
  return {
    id: apiAsteroid.i,
    baseName: apiAsteroid.baseName,
    scanned: apiAsteroid.scanned ?? false,
    name: apiAsteroid.name ?? apiAsteroid.baseName,
    owner: apiAsteroid.owner ?? null,
    spectralType: convertSpectralType(toSpectralType(apiAsteroid.spectralType)),
    radius: apiAsteroid.r,
    surfaceArea: 4 * apiAsteroid.r * apiAsteroid.r * Math.PI,
    size: convertSize(toSize(apiAsteroid.r)),
    eccentricity: apiAsteroid.orbital.e,
    inclination: apiAsteroid.orbital.i * (180 / Math.PI),
    semiMajorAxis: apiAsteroid.orbital.a,
    orbitalPeriod: orbit.getPeriod(),
  }
}

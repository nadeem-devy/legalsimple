export type StateCode = 'AZ' | 'NV' | 'TX'

export interface CourtInfo {
  name: string
  address?: string
}

export interface StateConfig {
  code: StateCode
  name: string
  fullName: string
  courts: {
    superior: CourtInfo
    district?: CourtInfo
    family?: CourtInfo
    probate?: CourtInfo
    smallClaims?: CourtInfo
  }
  filingFees: {
    family: number
    personalInjury: number
    estatePlanning: number
    smallClaims: number
  }
  statutes: {
    family: string
    personalInjury: string
    estatePlanning: string
  }
  counties: string[]
}

export const SUPPORTED_STATES: Record<StateCode, StateConfig> = {
  AZ: {
    code: 'AZ',
    name: 'Arizona',
    fullName: 'State of Arizona',
    courts: {
      superior: {
        name: 'Superior Court of Arizona',
      },
      family: {
        name: 'Arizona Superior Court - Family Court Division',
      },
      probate: {
        name: 'Arizona Superior Court - Probate Division',
      },
      smallClaims: {
        name: 'Arizona Justice Court',
      },
    },
    filingFees: {
      family: 349,
      personalInjury: 349,
      estatePlanning: 299,
      smallClaims: 75,
    },
    statutes: {
      family: 'Arizona Revised Statutes Title 25',
      personalInjury: 'Arizona Revised Statutes Title 12',
      estatePlanning: 'Arizona Revised Statutes Title 14',
    },
    counties: [
      'Maricopa',
      'Pima',
      'Pinal',
      'Yavapai',
      'Mohave',
      'Yuma',
      'Coconino',
      'Cochise',
      'Navajo',
      'Apache',
      'Gila',
      'Santa Cruz',
      'Graham',
      'La Paz',
      'Greenlee',
    ],
  },
  NV: {
    code: 'NV',
    name: 'Nevada',
    fullName: 'State of Nevada',
    courts: {
      superior: {
        name: 'Nevada District Court',
      },
      family: {
        name: 'Nevada Family Court',
      },
      probate: {
        name: 'Nevada District Court - Probate Division',
      },
      smallClaims: {
        name: 'Nevada Justice Court',
      },
    },
    filingFees: {
      family: 299,
      personalInjury: 299,
      estatePlanning: 250,
      smallClaims: 90,
    },
    statutes: {
      family: 'Nevada Revised Statutes Chapter 125',
      personalInjury: 'Nevada Revised Statutes Chapter 41',
      estatePlanning: 'Nevada Revised Statutes Chapter 132-137',
    },
    counties: [
      'Clark',
      'Washoe',
      'Carson City',
      'Douglas',
      'Elko',
      'Lyon',
      'Nye',
      'Churchill',
      'Humboldt',
      'White Pine',
      'Pershing',
      'Lander',
      'Mineral',
      'Lincoln',
      'Storey',
      'Eureka',
      'Esmeralda',
    ],
  },
  TX: {
    code: 'TX',
    name: 'Texas',
    fullName: 'State of Texas',
    courts: {
      superior: {
        name: 'Texas District Court',
      },
      district: {
        name: 'Texas District Court',
      },
      family: {
        name: 'Texas Family District Court',
      },
      probate: {
        name: 'Texas Statutory Probate Court',
      },
      smallClaims: {
        name: 'Texas Justice of the Peace Court',
      },
    },
    filingFees: {
      family: 320,
      personalInjury: 320,
      estatePlanning: 280,
      smallClaims: 54,
    },
    statutes: {
      family: 'Texas Family Code',
      personalInjury: 'Texas Civil Practice and Remedies Code',
      estatePlanning: 'Texas Estates Code',
    },
    counties: [
      'Harris',
      'Dallas',
      'Tarrant',
      'Bexar',
      'Travis',
      'Collin',
      'Hidalgo',
      'El Paso',
      'Denton',
      'Fort Bend',
      'Montgomery',
      'Williamson',
      'Cameron',
      'Nueces',
      'Brazoria',
      'Bell',
      'Galveston',
      'Lubbock',
      'Webb',
      'McLennan',
    ],
  },
}

export function getStateConfig(stateCode: StateCode): StateConfig {
  return SUPPORTED_STATES[stateCode]
}

export function getCourtName(stateCode: StateCode, caseType: string): string {
  const state = SUPPORTED_STATES[stateCode]

  switch (caseType) {
    case 'family_law':
      return state.courts.family?.name || state.courts.superior.name
    case 'estate_planning':
      return state.courts.probate?.name || state.courts.superior.name
    case 'personal_injury':
    default:
      return state.courts.superior.name
  }
}

export function getFilingFee(stateCode: StateCode, caseType: string): number {
  const state = SUPPORTED_STATES[stateCode]

  switch (caseType) {
    case 'family_law':
      return state.filingFees.family
    case 'estate_planning':
      return state.filingFees.estatePlanning
    case 'personal_injury':
      return state.filingFees.personalInjury
    default:
      return state.filingFees.personalInjury
  }
}

export const STATE_OPTIONS = Object.values(SUPPORTED_STATES).map(state => ({
  value: state.code,
  label: state.name,
}))

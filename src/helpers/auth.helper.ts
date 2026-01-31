import { LocalStorageKeys } from "../enums/local-storage.enum";

export const getAccessTokenFromHeader = (authorizationHeader?: string) => {
    const authHeader = authorizationHeader?.trim() || ''
    if (!authHeader) {
      return ''
    }
  
    const accessToken = authHeader.split(' ')?.[1]?.trim() || ''
    if (['undefined', 'null'].includes(accessToken)) {
      return ''
    }
  
    return accessToken
  }

  export const getAccessToken = () => {
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem(LocalStorageKeys.ACCESS_TOKEN)?.trim() || ''
      if (['undefined', 'null'].includes(accessToken)) {
        return ''
      }
  
      return accessToken
    }
  
    return ''
  }
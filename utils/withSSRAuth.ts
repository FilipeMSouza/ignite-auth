import decode from 'jwt-decode';
import { destroyCookie, parseCookies } from "nookies"
import { AuthTokenError } from "../src/pages/services/errors/AuthTokenError"
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next"
import { validateUserPermitions } from './validateUserPermitions';

type withSSRAuthoptions = {
  permissions?: string[];
  roles?: string[];
}

export function withSSRAuth<P>(fn: GetServerSideProps<P>, options?: withSSRAuthoptions) {

  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {

    const cookies = parseCookies(ctx)
    const token = cookies['IgAuth.token']

    if (!token) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        }
      }
    }


    if (options) {

      const user = decode<{ permissions: string[], roles: string[] }>(token);
      const { permissions, roles } = options

      const userHasValidPermissions = validateUserPermitions({
        user,
        permissions,
        roles
      })

      if (!userHasValidPermissions) {
        return {
          redirect: {
            destination: '/dashboard',
            permanent: false,
          }
        }
      }
    }

    try {

      return await fn(ctx)
    }
    catch (err) {

      if (err instanceof AuthTokenError) {

        destroyCookie(ctx, 'IgAuth.token')
        destroyCookie(ctx, 'IgAuth.refreshToken')
        return {
          redirect: {
            destination: '/',
            permanent: false,
          }
        }
      }
    }
  }

}
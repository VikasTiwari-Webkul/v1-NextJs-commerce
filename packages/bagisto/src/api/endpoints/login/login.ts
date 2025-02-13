import { FetcherError } from '@vercel/commerce/utils/errors'
import type { LoginEndpoint } from './'

const invalidCredentials = /invalid credentials/i

const login: LoginEndpoint['handlers']['login'] = async ({
  req,
  res,
  body: { email, password },
  config,
  commerce,
}) => {
  if (!(email && password)) {
    return res.status(400).json({
      data: null,
      errors: [{ message: 'Invalid request' }],
    })
  }

  try {
    await commerce.login({ variables: { email, password }, config, res })
  } catch (error) {
    // Check if the email and password didn't match an existing account.
    if (
      error instanceof FetcherError &&
      invalidCredentials.test(error.message)
    ) {
      return res.status(401).json({
        data: null,
        errors: [
          {
            message:
              'Cannot find an account that matches the provided credentials',
            code: 'invalid_credentials',
          },
        ],
      })
    }

    throw error
  }

  res.status(200).json({ data: null })
}

export default login

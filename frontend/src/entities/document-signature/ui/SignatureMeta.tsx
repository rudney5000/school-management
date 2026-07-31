import type { SignatureStatusResult } from "../model/types"

interface SignatureMetaProps {
  status: SignatureStatusResult
}

export function SignatureMeta({ status }: SignatureMetaProps) {
  if (!status.isSigned) {
    return null
  }

  const { signature } = status
  const signedDate = new Date(signature.signedAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })

  return (
    <div className="text-sm text-muted-foreground">
      <span className="font-medium text-foreground">{signature.signedByRole}</span>
      {' • '}
      {signedDate}
    </div>
  )
}

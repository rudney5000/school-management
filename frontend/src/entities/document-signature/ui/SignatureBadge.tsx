import { Badge } from "@shared/ui/badge"
import type { SignatureStatusResult } from "../model/types"

interface SignatureBadgeProps {
  status: SignatureStatusResult
}

export function SignatureBadge({ status }: SignatureBadgeProps) {
  if (!status.isSigned) {
    return <Badge variant="outline">Non signé</Badge>
  }

  if (status.isStale) {
    return <Badge variant="destructive">Périmé</Badge>
  }

  return <Badge variant="success">Signé</Badge>
}

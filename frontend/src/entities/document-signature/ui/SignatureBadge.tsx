import { Badge } from "@shared/ui/badge"
import type { SignatureStatusResult } from "../model/types"

interface SignatureBadgeLabels {
  signed: string
  notSigned: string
  expired: string
}

interface SignatureBadgeProps {
  status: SignatureStatusResult
  labels: SignatureBadgeLabels
}

export function SignatureBadge({
                                 status,
                                 labels,
                               }: SignatureBadgeProps) {
  if (!status.isSigned) {
    return <Badge variant="outline">{labels.notSigned}</Badge>
  }

  if (status.isStale) {
    return <Badge variant="destructive">{labels.expired}</Badge>
  }

  return <Badge variant="success">{labels.signed}</Badge>
}

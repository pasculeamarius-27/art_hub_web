/**
 * Pure domain contracts for a permissioned cultural graph.
 * This module is not a Firebase Security Rule, data store, or authorization boundary.
 */
export type Visibility = 'private' | 'public'
export type ApprovalState = 'draft' | 'approved' | 'withdrawn'
export type NodeKind = 'artist' | 'identity' | 'statement' | 'series' | 'artwork' | 'source' | 'space' | 'exhibition' | 'concept'
export type EdgeKind = 'created' | 'has_identity' | 'stated' | 'belongs_to' | 'describes' | 'exhibits' | 'supports'
export interface CulturalNode {
  id: string
  tenantId: string
  kind: NodeKind
  visibility: Visibility
  approval: ApprovalState
  version: number
  sourceId?: string
}
export interface CulturalEdge {
  id: string
  tenantId: string
  fromId: string
  toId: string
  kind: EdgeKind
  sourceId: string
  sourceVersion: number
  visibility: Visibility
  approval: ApprovalState
}
export interface GraphSnapshot {
  nodes: readonly CulturalNode[]
  edges: readonly CulturalEdge[]
}

/** Fail closed if provenance, approval or tenant relation is absent. */
export function publicSubgraph(snapshot: GraphSnapshot, tenantId: string): GraphSnapshot {
  const nodes = new Map(snapshot.nodes.filter((node) => node.tenantId === tenantId).map((node) => [node.id, node]))
  const validSource = (id: string, version: number) => {
    const node = nodes.get(id)
    return node?.kind === 'source' && node.visibility === 'public' && node.approval === 'approved' && node.version === version
  }
  const visible = new Map<string, CulturalNode>()
  for (const node of nodes.values()) {
    if (node.visibility !== 'public' || node.approval !== 'approved' || !Number.isSafeInteger(node.version) || node.version < 1) continue
    if (node.kind !== 'source' && (!node.sourceId || !nodes.has(node.sourceId))) continue
    if (node.kind !== 'source' && !validSource(node.sourceId!, nodes.get(node.sourceId!)!.version)) continue
    visible.set(node.id, node)
  }
  const edges = snapshot.edges.filter((edge) => edge.tenantId === tenantId && edge.visibility === 'public' && edge.approval === 'approved' && edge.sourceVersion > 0 && visible.has(edge.fromId) && visible.has(edge.toId) && validSource(edge.sourceId, edge.sourceVersion))
  return { nodes: [...visible.values()], edges }
}

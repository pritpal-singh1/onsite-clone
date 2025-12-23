/**
 * Material Data Constants
 * Default material types for construction
 */

export const MATERIAL_TYPES = [
  'Cement',
  'Steel/TMT Bars',
  'Bricks/Blocks',
  'Sand',
  'Aggregate/Gravel',
  'Ready Mix Concrete (RMC)',
  'Timber/Wood',
  'Paint',
  'Tiles/Flooring',
  'Plumbing Materials',
  'Electrical Materials',
  'Glass',
  'Aluminum',
  'Hardware/Fittings',
  'Waterproofing Materials',
  'Labor',
  'Machinery',
  'Equipment Rental',
  'Transportation',
  'Other',
] as const;

export type MaterialType = typeof MATERIAL_TYPES[number];

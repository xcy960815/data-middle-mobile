import { Text, View } from 'react-native';

export type ResourcePermissionValue = 'none' | 'view' | 'edit' | 'manage';

const permissionMeta: Record<
  ResourcePermissionValue,
  { label: string; color: string; backgroundColor: string }
> = {
  none: { label: '无权限', color: '#718198', backgroundColor: '#edf1f6' },
  view: { label: '可查看', color: '#2563eb', backgroundColor: '#e8f1ff' },
  edit: { label: '可编辑', color: '#047857', backgroundColor: '#e7f8ef' },
  manage: { label: '可管理', color: '#7c3aed', backgroundColor: '#f2eaff' },
};

export function getPermissionMeta(permission?: ResourcePermissionValue | null) {
  return permissionMeta[permission ?? 'none'];
}

export function PermissionBadge({ permission }: { permission?: ResourcePermissionValue | null }) {
  const meta = getPermissionMeta(permission);
  return (
    <View className="rounded-full px-2 py-1" style={{ backgroundColor: meta.backgroundColor }}>
      <Text className="text-[9px] font-black" style={{ color: meta.color }}>
        {meta.label}
      </Text>
    </View>
  );
}

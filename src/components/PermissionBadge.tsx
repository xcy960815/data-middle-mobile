import { Text, View } from 'react-native';

/** 资源权限取值：none 无权限、view 可查看、edit 可编辑、manage 可管理。 */
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

/**
 * 查询权限值对应的徽标文案与配色；未知或缺省权限按“无权限”处理。
 *
 * @param {ResourcePermissionValue | null} [permission] - 当前权限值。
 * @returns {{ label: string; color: string; backgroundColor: string }} 徽标文案、文字颜色与背景色。
 */
export function getPermissionMeta(permission?: ResourcePermissionValue | null) {
  return permissionMeta[permission ?? 'none'];
}

/**
 * 资源权限徽标：按权限值渲染彩色圆角标签，未知权限按“无权限”展示。
 *
 * @param {object} props - 组件属性。
 * @param {ResourcePermissionValue | null} [props.permission] - 当前用户对资源的权限值，缺省按无权限展示。
 * @returns {JSX.Element} 权限徽标。
 */
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

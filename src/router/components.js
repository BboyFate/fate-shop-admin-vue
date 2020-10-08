import Layout from '@/layout'
const Admin = () => import('@/views/auth/admin')
const Role = () => import('@/views/auth/role')
const Permission = () => import('@/views/auth/permission')
const VueMenu = () => import('@/views/auth/vueMenu')
const Order = () => import('@/views/order/order')

export default {
  Layout: Layout,
  Admin: Admin,
  Role: Role,
  Permission: Permission,
  VueMenu: VueMenu,
  Order: Order
};

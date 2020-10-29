import Layout from '@/layout'
const Admin = () => import('@/views/auth/admin')
const Role = () => import('@/views/auth/role')
const Permission = () => import('@/views/auth/permission')
const VueMenu = () => import('@/views/auth/vueMenu')
const Order = () => import('@/views/order/order')
const Product = () => import('@/views/product/product')
const EditProduct = () => import('@/views/product/edit')
const CreateProduct = () => import('@/views/product/create')
const CrowdfundingProduct = () => import('@/views/product/crowdfunding/crowdfunding')
const EditCrowdfundingProduct = () => import('@/views/product/crowdfunding/edit')
const CreateCrowdfundingProduct = () => import('@/views/product/crowdfunding/create')

export default {
  Layout: Layout,
  Admin: Admin,
  Role: Role,
  Permission: Permission,
  VueMenu: VueMenu,
  Order: Order,
  Product: Product,
  EditProduct: EditProduct,
  CreateProduct: CreateProduct,
  CrowdfundingProduct: CrowdfundingProduct,
  EditCrowdfundingProduct: EditCrowdfundingProduct,
  CreateCrowdfundingProduct: CreateCrowdfundingProduct,
};

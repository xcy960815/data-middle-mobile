import { Redirect } from 'expo-router';

/**
 * 根路径路由：将 / 重定向到 /welcome。
 *
 * @returns {JSX.Element} 重定向元素。
 */
export default function IndexRoute() {
  return <Redirect href="/welcome" />;
}

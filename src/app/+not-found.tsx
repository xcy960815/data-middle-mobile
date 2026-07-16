import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function NotFoundRoute() {
  return (
    <>
      <Stack.Screen options={{ title: '页面未找到' }} />
      <View style={styles.page}>
        <Text style={styles.eyebrow}>404 · NOT FOUND</Text>
        <Text style={styles.title}>这个页面不存在</Text>
        <Text style={styles.description}>访问地址可能有误，返回首页继续浏览数据中台。</Text>
        <Link accessibilityRole="link" href="/welcome" style={styles.link}>
          返回首页
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  page: {
    alignItems: 'center',
    backgroundColor: '#f5f9fe',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  eyebrow: { color: '#4c83ed', fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  title: { color: '#172033', fontSize: 28, fontWeight: '900', marginTop: 12 },
  description: {
    color: '#6c7d94',
    fontSize: 13,
    lineHeight: 21,
    marginTop: 10,
    textAlign: 'center',
  },
  link: {
    backgroundColor: '#3f7ff2',
    borderRadius: 12,
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 24,
    overflow: 'hidden',
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
});

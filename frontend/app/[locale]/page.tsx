import AgentInterfaceClient from './AgentInterfaceClient';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ar' }];
}

export default async function AgentInterface({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <AgentInterfaceClient locale={locale} />;
}

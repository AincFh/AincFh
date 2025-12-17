import PostPageClient from './PostPageClient';

export const runtime = 'edge';

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <PostPageClient postId={id} />;
}
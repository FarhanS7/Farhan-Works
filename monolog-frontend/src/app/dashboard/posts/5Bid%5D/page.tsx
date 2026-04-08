import { api } from "@/lib/api";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { EditPostEditor } from "./EditPostEditor";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  let post = null;
  let seriesList = [];

  try {
    const [p, s] = await Promise.all([
      api.posts.getAdminOne(id, {
        headers: { Cookie: `token=${token}` },
      }),
      api.series.getAll({
        headers: { Cookie: `token=${token}` },
      }),
    ]);
    post = p;
    seriesList = s;
  } catch (err) {
    console.error("Error loading post for edit:", err);
    notFound();
  }

  if (!post) notFound();

  return (
    <EditPostEditor initialPost={post} initialSeriesList={seriesList} />
  );
}

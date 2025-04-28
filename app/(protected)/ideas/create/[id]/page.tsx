import { redirect } from 'next/navigation'

const IdeaPage = async ({ params }: { params: { id: string } }) => {
  redirect(`/ideas/create/${params.id}/chat`)
}

export default IdeaPage
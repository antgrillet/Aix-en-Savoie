import { notFound } from 'next/navigation'
import { getMessage } from '../actions'
import { MessageView } from '../MessageView'

export default async function MessageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const message = await getMessage(parseInt(id))

  if (!message) {
    notFound()
  }

  return <MessageView message={message} />
}

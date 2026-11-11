import { PageHeader } from '@/components/admin/PageHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/admin/Tabs'
import { getMessages } from './actions'
import { MessagesList } from './MessagesList'

export default async function MessagesPage() {
  const allMessages = await getMessages('all')
  const unreadMessages = await getMessages('unread')
  const archivedMessages = await getMessages('archived')

  return (
    <div>
      <PageHeader
        title="Messages"
        description="Les messages envoyés depuis la page Contact du site. Ouvrir un message le marque comme lu."
      />

      <Tabs defaultValue="all">
        <TabsList aria-label="Filtrer les messages">
          <TabsTrigger value="all" count={allMessages.length}>
            Tous
          </TabsTrigger>
          <TabsTrigger value="unread" count={unreadMessages.length}>
            Non lus
          </TabsTrigger>
          <TabsTrigger value="archived" count={archivedMessages.length}>
            Archivés
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <MessagesList initialMessages={allMessages} view="all" />
        </TabsContent>

        <TabsContent value="unread">
          <MessagesList initialMessages={unreadMessages} view="unread" />
        </TabsContent>

        <TabsContent value="archived">
          <MessagesList initialMessages={archivedMessages} view="archived" />
        </TabsContent>
      </Tabs>
    </div>
  )
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getMessages } from './actions'
import { MessagesList } from './MessagesList'

export default async function MessagesPage() {
  const allMessages = await getMessages('all')
  const unreadMessages = await getMessages('unread')
  const archivedMessages = await getMessages('archived')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
          Messages
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Gérez les messages de contact
        </p>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="bg-gradient-to-r from-orange-100 to-blue-100 w-full sm:w-auto flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="all" className="flex-1 sm:flex-none text-xs sm:text-sm">
            Tous ({allMessages.length})
          </TabsTrigger>
          <TabsTrigger value="unread" className="flex-1 sm:flex-none text-xs sm:text-sm">
            Non lus ({unreadMessages.length})
          </TabsTrigger>
          <TabsTrigger value="archived" className="flex-1 sm:flex-none text-xs sm:text-sm">
            Archivés ({archivedMessages.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-white to-orange-50">
            <CardHeader>
              <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                Tous les messages
              </CardTitle>
              <CardDescription>{allMessages.length} message{allMessages.length > 1 ? 's' : ''}</CardDescription>
            </CardHeader>
            <CardContent>
              <MessagesList initialMessages={allMessages} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unread">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-white to-orange-50">
            <CardHeader>
              <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                Messages non lus
              </CardTitle>
              <CardDescription>{unreadMessages.length} message{unreadMessages.length > 1 ? 's' : ''}</CardDescription>
            </CardHeader>
            <CardContent>
              <MessagesList initialMessages={unreadMessages} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archived">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-white to-orange-50">
            <CardHeader>
              <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                Messages archivés
              </CardTitle>
              <CardDescription>{archivedMessages.length} message{archivedMessages.length > 1 ? 's' : ''}</CardDescription>
            </CardHeader>
            <CardContent>
              <MessagesList initialMessages={archivedMessages} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

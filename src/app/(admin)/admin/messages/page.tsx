import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { getMessages } from './actions'
import { MessagesList } from './MessagesList'

export default async function MessagesPage() {
  const allMessages = await getMessages('all')
  const unreadMessages = await getMessages('unread')
  const archivedMessages = await getMessages('archived')

  const tabs = [
    { value: 'all', label: 'Tous', messages: allMessages },
    { value: 'unread', label: 'Non lus', messages: unreadMessages },
    { value: 'archived', label: 'Archivés', messages: archivedMessages },
  ]

  return (
    <div>
      <AdminPageHeader
        title="Messages"
        description={
          unreadMessages.length > 0
            ? `${unreadMessages.length} message${unreadMessages.length > 1 ? 's' : ''} non lu${unreadMessages.length > 1 ? 's' : ''} · formulaire de contact du site`
            : 'Messages reçus via le formulaire de contact du site'
        }
      />

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="h-auto w-full justify-start gap-1 border bg-card p-1 shadow-xs sm:w-auto">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="h-8 flex-1 gap-2 px-3 data-[state=active]:bg-neutral-900 data-[state=active]:text-white data-[state=active]:shadow-none sm:flex-none"
            >
              {tab.label}
              <span className="rounded-full bg-black/5 px-1.5 py-px text-[0.7rem] font-semibold tabular-nums [[data-state=active]_&]:bg-white/15">
                {tab.messages.length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-0">
            <Card className="overflow-hidden">
              <MessagesList initialMessages={tab.messages} />
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

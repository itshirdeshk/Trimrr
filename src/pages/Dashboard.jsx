import React, { useEffect, useState } from 'react'
import { BarLoader } from 'react-spinners'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from '@/components/ui/input'
import { urlState } from '@/context';
import useFetch from '@/hooks/useFetch';
import { getUrls } from '@/db/apiUrls';
import { getClickForUrls } from '@/db/apiClicks';
import LinkCard from '@/components/LinkCard';
import { Filter } from 'lucide-react'
import CreateLink from '@/components/CreateLink'

function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");

  const { user } = urlState();
  const { loading, error, data: urls, fn: fnUrls } = useFetch(getUrls, user.id);
  const { loading: loadingClicks, data: clicks, fn: fnClicks } = useFetch(getClickForUrls, urls?.map((url) => url.id))

  useEffect(() => {
    fnUrls();
  }, [])

  useEffect(() => {
    if (urls?.length) fnClicks();
  }, [urls?.length])

  const filteredUrls = urls?.filter((url) => url.title.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className='flex flex-col gaps-8'>
      {(loading || loadingClicks) && (<BarLoader width={"100%"} color='#36d7b7' />)}
      <div className='grid grid-cols-2 gap-4'>
        <Card>
          <CardHeader>
            <CardTitle>Link Created</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{urls?.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{clicks?.length ? clicks?.length : 0}</p>
          </CardContent>
        </Card>
      </div>
      <div className='flex justify-between mt-6'>
        <h1 className='text-4xl font-extrabold'>My Links</h1>
        <CreateLink />
      </div>

      <div className='relative my-4'>
        <Input type="text" placeholder="Filter Links..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <Filter className="absolute top-2 right-2 p-1" />
      </div>
      {error && <Error message={error?.message}
      />}
      {filteredUrls.length > 0 ? filteredUrls.map((url, i) =>
        <LinkCard key={i} url={url} fetchUrls={fnUrls} />
      ) : "No Links Created..."}
    </div>
  )
}

export default Dashboard
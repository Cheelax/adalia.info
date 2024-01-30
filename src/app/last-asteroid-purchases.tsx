import { ArrowRightIcon } from 'lucide-react'
import { db } from '@/server/db'
import { Address } from '@/components/address'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { AsteroidImage } from '@/components/asteroid-image'

export const LastAsteroidPurchases = async () => {
  const lastPurchases = await db.asteroidOwnerChange.findMany({
    take: 10,
    where: {
      fromAddress: null,
    },
    orderBy: {
      timestamp: 'desc',
    },
    include: {
      asteroid: true,
    },
  })

  return (
    <div className='flex flex-col items-center gap-y-3'>
      <h1>Last purchases</h1>

      <Carousel className='w-3/4'>
        <CarouselContent>
          {lastPurchases.map((asteroid) => (
            <CarouselItem
              key={asteroid.id}
              className='sm:basis-1/2 md:basis-1/3 xl:basis-1/4 2xl:basis-1/5'
            >
              <div className='flex flex-col items-center justify-center gap-y-2'>
                <AsteroidImage id={asteroid.id} width={250} />
                <div className='flex items-center justify-center gap-x-2'>
                  <ArrowRightIcon size={25} className='text-primary' />
                  <Address address={asteroid.toAddress} shownCharacters={4} />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}

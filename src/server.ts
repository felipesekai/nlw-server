import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { convertHoursStringToMinutes } from './utils/convert-hour-string-to-minutes';
import { convertMinutesToHoursString } from './utils/convert-minutes-to-hour-string';

const app = express();
app.use(express.json());
app.use(cors());

const prisma = new PrismaClient({
    log: ['query']
})

// HTTP methods / API RESTful / HTTP codes

// GET, POST, PUT, DELETE, PATCH

app.get('/games', async (request, response) => {
    const games = await prisma.game.findMany({
        include: {
            _count: {
                select: {
                    ads: true,
                }
            }
        }
    })
    return response.json(games);
})
// post new ad by game id
app.post('/games/:id/ads', async (request, response) => {

    const gameId = request.params.id;
    const body: any = request.body;
    const newAd = await prisma.ad.create({
        data: {
            gameId,
            name: body.name,
            yearsPlaying: body.yearsPlaying,
            discord: body.discord,
            weekDays: body.weekDays.join(','),
            hoursStart: convertHoursStringToMinutes(body.hoursStart),
            hourEnd: convertHoursStringToMinutes(body.hourEnd),
            useVoiceChannel: body.useVoiceChannel
        }
    })

    return response.status(201).json(newAd);
})

//GET allAds
app.get('/ads', async (request, response) => {

    const ads = await prisma.ad.findMany({
        select: {
            id: true,
            name: true,
            gameId: true,
            yearsPlaying: true,
            weekDays: true,
            hoursStart: true,
            hourEnd: true,
            useVoiceChannel: true,

        },
        orderBy: {
            createdAt: 'desc',
        }
    });

    return response.json(ads.map(ad => {
        return {
            ...ad,
            weekDays: ad.weekDays.split(','),
            hoursStart: convertMinutesToHoursString(ad.hoursStart),
            hourEnd: convertMinutesToHoursString(ad.hourEnd),
        }
    }));


})

app.get('/games/:id/ads', async (request, response) => {
    const gameId = request.params.id;

    const ads = await prisma.ad.findMany({
        select: {
            id: true,
            name: true,
            yearsPlaying: true,
            weekDays: true,
            hoursStart: true,
            hourEnd: true,

        },
        where: {
            gameId,
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
    return response.json(ads.map(ad => {
        return {
            ...ad,
            weekDays: ad.weekDays.split(','),
            hoursStart: convertMinutesToHoursString(ad.hoursStart),
            hourEnd: convertMinutesToHoursString(ad.hourEnd),
        }
    }));
})

app.get('/ads/:id/discord', async (request, response) => {
    const adId = request.params.id;

    const ad = await prisma.ad.findUniqueOrThrow({
        select: {
            discord: true,
        },
        where: {
            id: adId,
        }
    })
    return response.json(ad);
})


app.listen(3333);
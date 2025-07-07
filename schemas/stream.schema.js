import { z } from 'zod';

export const TypedMessageSchema = z.object({
    type: z.string(),
});

const decimalRegex = /^[+-]?\d+(\.\d+)?$/;

export const PositionPnLSchema = z.object({
    positionId: z.string(),
    pnl: z.string().regex(decimalRegex, 'Must be a decimal string'),
});

export const AccountStatusMessageSchema = z.object({
    type: z.literal('AccountStatus'),
    accountId: z.string(),
    currency: z.string(),
    balance: z.string().regex(decimalRegex).optional(),
    marginAvailable: z.string().regex(decimalRegex).optional(),
    marginUsed: z.string().regex(decimalRegex).optional(),
    blockedBalance: z.string().regex(decimalRegex).optional(),
    credit: z.string().regex(decimalRegex).optional(),
    equity: z.string().regex(decimalRegex).optional(),
    positionPnLs: z.array(PositionPnLSchema).optional(),
});



export const ClosePositionMessageSchema = z.object({
    type: z.literal('ClosePosition'),
    positionId: z.string(),
    closePrice: z.string().nullable(),
    closeDateTime: z.string(),
});


export const OpenOrderMessageSchema = z.object({
    type: z.literal('OpenOrder'),
    accountId: z.string(),
    amount: z.string().regex(decimalRegex),
    lotSize: z.string().regex(decimalRegex),
    averageFilledPrice: z.string().regex(decimalRegex),
    createdDateTime: z.string(),
    expireDateTime: z.string().nullable().optional(),
    filledAmount: z.string().regex(decimalRegex).nullable(),
    orderId: z.string(),
    price: z.string().regex(decimalRegex).nullable(),
    side: z.enum(['BUY', 'SELL']),
    slLimitPrice: z.string().regex(decimalRegex).nullable().optional(),
    slPrice: z.string().regex(decimalRegex).nullable().optional(),
    slPriceType: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    stopPrice: z.string().regex(decimalRegex).nullable().optional(),
    tif: z.string(),
    tpPrice: z.string().regex(decimalRegex).nullable().optional(),
    tpPriceType: z.string().nullable().optional(),
    instrument: z.string(),
    orderType: z.string(),
    positionId: z.string().nullable(),
    lastUpdate: z.string(),
    isOpen: z.boolean(),
    trStopOffset: z.string().regex(decimalRegex).nullable(),
});

export const PositionMessageSchema = z.object({
    type: z.literal('Position'),
    accountId: z.string(),
    lots: z.string().regex(decimalRegex),
    lotSize: z.string().regex(decimalRegex),
    units: z.string().regex(decimalRegex),
    instrument: z.string(),
    openPrice: z.string().regex(decimalRegex),
    openDateTime: z.string(),
    positionId: z.string(),
    openOrderId: z.string().nullable().optional(),
    stopLossOrderId: z.string().nullable().optional(),
    maintMargin: z.string().regex(decimalRegex),
    takeProfitOrderId: z.string().nullable().optional(),
    side: z.enum(['BUY', 'SELL']),
});

export const PropertyMessageSchema = z.object({
    type: z.literal('Property'),
    name: z.enum(['SyncEnd', 'Disconnected']),
});

export const StatusMessageSchema = z.object({
    status: z.enum(['ok', 'error']),
    code: z.string(),
    message: z.string(),
    remainingRequests: z.number().optional(),
});

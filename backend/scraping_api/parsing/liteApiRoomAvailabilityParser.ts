type LiteApiHotelDetail = {
  id?: string;
  name?: string;
  main_photo?: string;
  thumbnail?: string;
  address?: string;
  rating?: number;
};

export function normalizeLiteApiRooms(
  data: any[] = [],
  hotelDetails: LiteApiHotelDetail[] = []
) {
  const hotelsLookup = new Map(
    hotelDetails.map((hotel) => [hotel.id, hotel])
  );

  return data.flatMap((hotel) => {
    const hotelId = hotel.hotelId;
    const hotelInfo = hotelsLookup.get(hotelId);

    return (hotel.roomTypes || []).flatMap((roomType: any) => {
      return (roomType.rates || []).map((rate: any) => {
        const total = rate.retailRate?.total?.[0];
        const suggested = rate.retailRate?.suggestedSellingPrice?.[0];
        const initial = rate.retailRate?.initialPrice?.[0];

        return {
          hotelId,
          hotelName: hotelInfo?.name ?? null,
          hotelImage: hotelInfo?.main_photo ?? hotelInfo?.thumbnail ?? null,
          hotelAddress: hotelInfo?.address ?? null,
          hotelRating: hotelInfo?.rating ?? null,

          roomTypeId: roomType.roomTypeId ?? null,
          offerId: roomType.offerId ?? null,
          supplier: roomType.supplier ?? null,
          supplierId: roomType.supplierId ?? null,

          rateId: rate.rateId ?? null,
          roomName: rate.name ?? null,
          maxOccupancy: rate.maxOccupancy ?? null,
          adultCount: rate.adultCount ?? null,
          childCount: rate.childCount ?? null,
          childrenAges: rate.childrenAges ?? [],

          boardType: rate.boardType ?? null,
          boardName: rate.boardName ?? null,
          remarks: rate.remarks ?? "",

          price: total?.amount ?? null,
          currency: total?.currency ?? null,

          suggestedSellingPrice: suggested?.amount ?? null,
          suggestedSellingCurrency: suggested?.currency ?? null,
          suggestedSellingSource: suggested?.source ?? null,

          initialPrice: initial?.amount ?? null,
          initialCurrency: initial?.currency ?? null,

          taxesAndFees: rate.retailRate?.taxesAndFees ?? [],
          promotions: rate.retailRate?.promotions ?? [],

          refundable: rate.cancellationPolicies?.refundableTag === "RFN",
          refundableTag: rate.cancellationPolicies?.refundableTag ?? null,
          cancellationPolicy: rate.cancellationPolicies ?? null,

          paymentTypes: rate.paymentTypes ?? [],
          perks: rate.perks ?? [],

          priceType: rate.priceType ?? roomType.priceType ?? null,
          rateType: roomType.rateType ?? null,
        };
      });
    });
  });
}
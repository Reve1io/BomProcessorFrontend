export function adaptSecondApiToRows(secondApiJson: any) {
    if (!secondApiJson?.data) return [];

    return secondApiJson.data.map((item: any) => ({
        requested_mpn: item.requested_mpn,
        mpn: item.mpn,
        manufacturer: item.manufacturer ?? "-",
        seller_name: item.seller_name ?? "-",
        stock: item.stock ?? "-",
        requested_quantity: item.requested_quantity ?? 1,

        priceBreaks: item.priceBreaks ?? [],

        status: item.status ?? "-",
    }));
}

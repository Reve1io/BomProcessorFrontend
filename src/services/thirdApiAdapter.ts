export function adaptThirdApiToRows(data: any[]) {
    if (!Array.isArray(data)) return [];

    return data.map(item => ({
        mpn: item.mpn,
        requested_mpn: item.requested_mpn,
        requested_quantity: item.requested_quantity,
        manufacturer: item.manufacturer,
        seller_name: item.supplier ?? "dcp service",
        stock: item.stock,
        status: item.status,
        priceBreaks: item.priceBreaks ?? [],
    }));
}
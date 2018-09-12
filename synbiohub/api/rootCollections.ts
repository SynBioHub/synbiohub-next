
async function rootCollections(req, res) {

	var results = DefaultMDFetcher.get(req).getRootCollectionMetadata()

	res.header('content-type', 'application/json').send(JSON.stringify(results))

}

export default rootCollections;


import SBHURI from "synbiohub/SBHURI";
import parseForm from "synbiohub/parseForm";
import { SBOL2Graph } from "sbolgraph";
import SBOLUploader from "synbiohub/SBOLUploader";
import { OverwriteMergeOption } from "synbiohub/OverwriteMerge";
import loadTemplate from "synbiohub/loadTemplate";
import * as sparql from 'synbiohub/sparql/sparql';
const attachments = require('../attachments')
const fs = require('mz/fs')
import uploads from '../uploads'

export default async function (req, res) {


        let uri = SBHURI.fromURIOrURL(req.url)

        let { fields, files } = await parseForm(req)

        let type = fields["fieldType"][0]


        if (type === "plan"){

            let old_plan_id = fields["old_plan_id"][0]
            let old_plan_uri = uri.getURIPrefix() + old_plan_id + "/" + uri.getVersion()

            let new_plan_uri


            if (files['file'][0]['size'] == 0){
                new_plan_uri = SBHURI.fromURIOrURL(fields["plan1"][0].split(',')[0])

            }

            else{
                new_plan_uri = SBHURI.fromURIOrURL(uri.getURIPrefix() + fields["plan2"][0] + "/" + uri.getVersion())
            }

            let graph = new SBOL2Graph()

            let plan = graph.createProvPlan(new_plan_uri.getURIPrefix(), new_plan_uri.getDisplayId(), new_plan_uri.getVersion())
            plan.displayId = new_plan_uri.getDisplayId()
            plan.name = new_plan_uri.getDisplayId()
            
            let asc = graph.createProvAssociation(uri.getURIPrefix(), uri.getDisplayId() + '_association', uri.getVersion())

            asc.plan = plan

            let old_uri = SBHURI.fromURIOrURL(old_plan_uri)


            var templateParams = {
                subject:asc.uri,
                predicate:"http://www.w3.org/ns/prov#hadPlan",
                object:old_plan_uri
            }

            console.log(templateParams)

            var removeQuery = loadTemplate('sparql/removeSpecificTriple.sparql', templateParams)

            await sparql.deleteStaggered(removeQuery, old_uri.getGraph())

            let uploader = new SBOLUploader()
            uploader.setGraph(graph)
            uploader.setDestinationGraphUri(new_plan_uri.getGraph())
            uploader.setOverwriteMerge(OverwriteMergeOption.FailIfExists)

            await uploader.upload()


    


            if (files['file'][0]['size'] != 0){


                let fileStream = await fs.createReadStream(files['file'][0]['path']);
                let uploadInfo = await uploads.createUpload(fileStream)
                const { hash, size, mime } = uploadInfo
                await attachments.addAttachmentToTopLevel(uri.getGraph(), uri.getURIPrefix() 
                , new_plan_uri,
                files['file'][0]['originalFilename'], hash, size, mime,
                uri.getGraph().split('/').pop)
            }


            res.redirect(uri)
            

        }


}
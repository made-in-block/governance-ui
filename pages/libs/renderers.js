import { Link } from "@nextui-org/react"

// Render ID table cell with link to explorer
export const renderPropIDCell = (id, chain_id) => {

    // TODO: Use chain_id to get base explorer url

    let explorer_url = `https://www.mintscan.io/${chain_id}/proposals/${id}`;

    return (
        <Link icon
            color="primary"
            target="_blank"
            href={explorer_url}
        >
            {id}
        </Link>
    )
}
import { Container, Row, Spacer, Table, Col, Text, Button, Loading } from "@nextui-org/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { StyledBadge } from "../components/styledBadge";
import { voteProposal } from "../libs/cosmos";
import { VoteOption } from "cosmjs-types/cosmos/gov/v1beta1/gov.js";
import { getChainInfo } from "../libs/chains";
import { DocumentIcon } from "../components/icons/documentIcon";
import { SwapIcon } from "../components/icons/swapIcon";
import { ChartIcon } from "../components/icons/chartIcon";
import Link from "next/link";
import { renderPropIDCell } from "../libs/renderers";

export default function Home() {

  const columns = [
    { name: "ID", uid: "id" },
    { name: "Chain", uid: "chain_id" },
    { name: "Title", uid: "title", maxWidth: 200 },
    { name: "Voting End", uid: "voting_end" },
    { name: "Status", uid: "status" },
    { name: "Actions", uid: "actions" },
  ];

  const [proposals, setProposals] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);

  const populateDb = async () => {
    setFetching(true)
    let res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/populate_db`)
    setMessage({ type: "success", message: `${res.data.totalProps} proposals fetched from chain, ${res.data.newProps} new.` })
    setFetching(false)
  }

  const fetchProposals = async (all = false) => {
    if (all) {
      setLoadingAll(true)
    };

    let path = all ? "proposals" : "active_proposals"
    let res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/${path}/juno1sjllsnramtg3ewxqwwrwjxfgc4n4ef9uee0aeq`)
    setProposals(res.data.data)
    setLoadingAll(false)
  }

  useEffect(() => {
    fetchProposals()
  }, [])

  const onClickVote = async (proposal, option) => {
    setLoading(true)
    setMessage(null)
    await fetchProposals(); // We need this otherwise the stupid table will not re-render

    let chain = getChainInfo(proposal)

    try {
      var tx = await voteProposal(chain.chain_id, `https://rpc.cosmos.directory/${chain.name}`, chain.voter_address, proposal.id, option)

      // {code: 11, height: 5481083, rawLog: 'out of gas in location: ReadPerByte; gasWanted: 200000, gasUsed: 315796: out of gas', transactionHash: '42E719587E4FB45F294B3A02B4F552D870A52D1DB7335D7725FE47E81BB8C975', gasUsed: 315796, …}code: 11gasUsed: 315796gasWanted: 200000height: 5481083rawLog: "out of gas in location: ReadPerByte; gasWanted: 200000, gasUsed: 315796: out of gas"transactionHash: "42E719587E4FB45F294B3A02B4F552D870A52D1DB7335D7725FE47E81BB8C975"[[Prototype]]: Object
      // {code: 0, height: 5481095, rawLog: '[{"events":[{"type":"message","attributes":[{"key"…000\\"}"},{"key":"proposal_id","value":"305"}]}]}]', transactionHash: '2A9467C0CAD5F892CC48C51E07B7274937BA48D9EA451AAD8533BF9CBFA6733E', gasUsed: 320857, …}

      if (tx.code != 0) {
        throw (Error(`Transaction error ${tx.rawLog}. ${tx.transactionHash}`))
      }

      // Index transaction in database
      const res = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/index_tx/${tx.transactionHash}`, {
        chain_name: chain.name
      });

      console.log(res)

      setMessage({ message: `Voted! TxHash: ${tx.transactionHash}`, type: "success" })

    } catch (error) {
      setMessage({ message: `${error}`, type: "error" })
    }

    setLoading(false)

    // Reload proposals
    await fetchProposals();
  }

  const renderCell = (proposal, columnKey) => {
    const cellValue = proposal[columnKey];
    switch (columnKey) {

      case "id":
        return renderPropIDCell(proposal.id, proposal.chain_id);

      case "status":
        if (proposal.votes.length == 0) {
          return <StyledBadge type="neutral">Missing Vote</StyledBadge>;
        }

        // check vote direction
        switch (parseInt(proposal.votes[0].option)) {
          case VoteOption.VOTE_OPTION_YES:
            return <StyledBadge type="success">Voted YES</StyledBadge>;
          case VoteOption.VOTE_OPTION_NO:
            return <StyledBadge type="error">Voted NO</StyledBadge>;
          case VoteOption.VOTE_OPTION_NO_WITH_VETO:
            return <StyledBadge type="error">Voted NO WITH VETO</StyledBadge>;
          case VoteOption.VOTE_OPTION_ABSTAIN:
            return <StyledBadge type="warning">Voted ABSTAIN</StyledBadge>;
        }

        break;
      case "voting_end":
        return new Date(cellValue).toLocaleDateString() + " " + new Date(cellValue).toLocaleTimeString();

      case "title":
        if (cellValue.length > 80) {
          return cellValue.substring(0, 80) + "..."
        };
        return cellValue;

      case "actions":
        return (<Row justify="center" align="center">
          <Col css={{ d: "flex" }}><Button disabled={loading} color="primary" size="xs" auto onClick={() => { onClickVote(proposal, VoteOption.VOTE_OPTION_YES) }}>Vote YES</Button></Col>
          <Col css={{ d: "flex" }}><Button disabled={loading} color="error" size="xs" auto onClick={() => { onClickVote(proposal, VoteOption.VOTE_OPTION_NO) }}>Vote NO</Button></Col>
          <Col css={{ d: "flex" }}><Button disabled={loading} color="warning" size="xs" auto onClick={() => { onClickVote(proposal, VoteOption.VOTE_OPTION_ABSTAIN) }}>Vote Abstain</Button></Col>
          <Col css={{ d: "flex" }}><Button disabled={loading} color="error" size="xs" auto onClick={() => { onClickVote(proposal, VoteOption.VOTE_OPTION_NO_WITH_VETO) }}>Vote VETO</Button></Col>

        </Row>)

      default:
        return cellValue;
    }
  };

  return (
    <Container xl>
      <Spacer y={1} />
      <h1>MiB 🛸 - governance proposals</h1>
      <Spacer y={1} />

      {loading &&
        <><Loading type="points" /><Spacer y={1} /></>
      }

      {message && <>
        <Text color={message.type}>
          {message.message}
        </Text>
        <Spacer y={1} />
      </>
      }

      <Row gap={1} justify="flex-end" align="flex-end">
        <Col offset={9}>
          {fetching && <Button disabled size="md" auto>
            <Loading color="currentColor" size="sm" />
          </Button>}
          {!fetching && <Button onClick={() => { populateDb() }} size="md" auto icon={<SwapIcon fill="currentColor" filled="true" />}>Update proposals</Button>}
        </Col>
        <Col>
          {loadingAll && <Button disabled size="md" auto>
            <Loading color="currentColor" size="sm" />
          </Button>}
          {!loadingAll && <Button onClick={() => { fetchProposals(true) }} color="secondary" size="md" auto icon={<DocumentIcon fill="currentColor" filled="true" />} >History</Button>}
        </Col>
        <Col>
          <Link href="/reports">
            <Button color="gradient" size="md" auto icon={<ChartIcon fill="currentColor" filled="true" />} >Reports</Button></Link>
        </Col>
      </Row>
      <Spacer y={1} />

      <Table
        aria-label="Proposal Table"
        css={{
          height: "auto",
          minWidth: "100%",
        }}
        selectionMode="none"
      >
        <Table.Header columns={columns}>
          {(column) => (
            <Table.Column
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
            >
              {column.name}
            </Table.Column>
          )}
        </Table.Header>
        <Table.Body items={proposals}>
          {(item) => (
            <Table.Row key={item.chain_id + "-" + item.id}>
              {(columnKey) => (
                <Table.Cell>{renderCell(item, columnKey)}</Table.Cell>
              )}
            </Table.Row>
          )}
        </Table.Body>
      </Table>
    </Container>
  )
}

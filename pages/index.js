import { Container, Row, Spacer, Table, Col, Text, Button, Loading } from "@nextui-org/react";
import { IconButton } from './components/iconButton';
import { EyeIcon } from './components/eyeIcon';
import { EditIcon } from './components/editIcon';
import { DeleteIcon } from './components/deleteIcon';
import { useEffect, useState } from "react";
import axios from "axios";
import { StyledBadge } from "./components/styledBadge";
import { voteProposal } from "./libs/cosmos";
import { VoteOption } from "cosmjs-types/cosmos/gov/v1beta1/gov.js";
import { getChainInfo } from "./libs/chains";

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

  useEffect(() => {

    axios.get("http://127.0.0.1:3001/active_proposals/juno1sjllsnramtg3ewxqwwrwjxfgc4n4ef9uee0aeq").then(res => {
      setProposals(res.data.data)
    });
   
  }, [])

  const onClickVote = async (proposal, option) => {
    setLoading(true)
    setMessage(null)

    let chain = getChainInfo(proposal)

    try {
      var tx = await voteProposal(chain.chain_id, `https://rpc.cosmos.directory/${chain.name}`, "osmo1sjllsnramtg3ewxqwwrwjxfgc4n4ef9u8slkgw", proposal.id, option)
      setMessage({message: `Voted! TxHash: ${tx.transactionHash}`, type: "success"})
    } catch (error) {
      setMessage({message: `${error}`, type: "error"})
    }

    setLoading(false)
  }

  const renderCell = (proposal, columnKey) => {
    const cellValue = proposal[columnKey];
    switch (columnKey) {
  
      case "status":
        if (proposal.votes.length == 0) {
          return <StyledBadge type="neutral">Missing Vote</StyledBadge>;
        }

        // check vote direction
        switch (proposal.votes[0].option) {
          case "YES":
            return <StyledBadge type="success">Voted YES</StyledBadge>;
          case "NO":
            return <StyledBadge type="error">Voted NO</StyledBadge>;
          case "VETO":
            return <StyledBadge type="error">Voted NO WITH VETO</StyledBadge>;
          case "ABSTAIN":
            return <StyledBadge type="warning">Voted ABSTAIN</StyledBadge>;
        }
        
        break;
      case "voting_end":
        return new Date(cellValue).toLocaleDateString() + " " + new Date(cellValue).toLocaleTimeString() ;

      case "title":
        if (cellValue.length > 80) {
          return cellValue.substring(0, 80) + "..."
        };
        return cellValue;

      case "actions":
        return (<Row justify="center" align="center">
          <Col css={{ d: "flex" }}><Button disabled={loading} color="primary" size="xs" auto onClick={() => {onClickVote(proposal, VoteOption.VOTE_OPTION_YES)}}>Vote YES</Button></Col>
          <Col css={{ d: "flex" }}><Button disabled={loading} color="error" size="xs" auto onClick={() => {onClickVote(proposal, VoteOption.VOTE_OPTION_NO)}}>Vote NO</Button></Col>
          <Col css={{ d: "flex" }}><Button disabled={loading} color="warning" size="xs" auto onClick={() => {onClickVote(proposal, VoteOption.VOTE_OPTION_ABSTAIN)}}>Vote Abstain</Button></Col>
        </Row>)

      default:
        return cellValue;
    }
  };

  return (
    <Container>
      <Spacer y={1} />
      <h1>stakefish 🐠 - governance proposals</h1>
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

      <Table
        aria-label="Example table with custom cells"
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
              maxWidth={200}
              align={column.uid === "actions" ? "center" : "start"}
            >
              {column.name}
            </Table.Column>
          )}
        </Table.Header>
        <Table.Body items={proposals}>
          {(item) => (
            <Table.Row>
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

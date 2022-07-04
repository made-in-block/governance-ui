import { Container, Row, Spacer, Table, Col, Tooltip } from "@nextui-org/react";
import { IconButton } from './components/iconButton';
import { EyeIcon } from './components/eyeIcon';
import { EditIcon } from './components/editIcon';
import { DeleteIcon } from './components/deleteIcon';
import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {

  const columns = [
    { name: "ID", uid: "id" },
    { name: "Chain", uid: "chain_id" },
    { name: "Title", uid: "title", maxWidth: 200 },
    { name: "Voting End", uid: "voting_end" },
    { name: "Actions", uid: "actions" },
  ];
  
  const [proposals, setProposals] = useState([]);

  useEffect(() => {

    axios.get("http://127.0.0.1:3001/active_proposals").then(res => {
      setProposals(res.data.data)
    });
   
  }, [])

  const renderCell = (proposal, columnKey) => {
    const cellValue = proposal[columnKey];
    switch (columnKey) {
  
      case "voting_end":
        return new Date(cellValue).toLocaleDateString() + " " + new Date(cellValue).toLocaleTimeString() ;

      case "title":
        if (cellValue.length > 80) {
          return cellValue.substring(0, 80) + "..."
        };
      return cellValue;

      case "actions":
        return (
          <Row justify="center" align="center">
            <Col css={{ d: "flex" }}>
              <Tooltip content="Details">
                <IconButton onClick={() => console.log("View user", proposal.id)}>
                  <EyeIcon size={20} fill="#979797" />
                </IconButton>
              </Tooltip>
            </Col>
            <Col css={{ d: "flex" }}>
              <Tooltip content="Edit user">
                <IconButton onClick={() => console.log("Edit user", proposal.id)}>
                  <EditIcon size={20} fill="#979797" />
                </IconButton>
              </Tooltip>
            </Col>
            <Col css={{ d: "flex" }}>
              <Tooltip
                content="Delete user"
                color="error"
                onClick={() => console.log("Delete user", proposal.id)}
              >
                <IconButton>
                  <DeleteIcon size={20} fill="#FF0080" />
                </IconButton>
              </Tooltip>
            </Col>
          </Row>
        );
      default:
        return cellValue;
    }
  };

  return (
    <Container>
      <h1>stakefish 🐠 - governance proposals</h1>
      <Spacer y={1} />
     
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

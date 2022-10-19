import { Container, Row, Spacer, Table, Col, Text, Button, Loading, Input, Dropdown, Grid } from "@nextui-org/react";
import { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { StyledBadge } from "../components/styledBadge";
import { VoteOption } from "cosmjs-types/cosmos/gov/v1beta1/gov.js";
import { DocumentIcon } from "../components/icons/documentIcon";
import Link from "next/link";
import { getCurrentWeek, getWeekCount } from "../libs/weeks";
import { renderPropIDCell } from "../libs/renderers";

export default function Home() {

    const columns = [
        { name: "ID", uid: "proposal_id" },
        { name: "Chain", uid: "chain_id" },
        { name: "Title", uid: "title", maxWidth: 200 },
        { name: "Rationale", uid: "rationale"},
        { name: "Voted at", uid: "date" },
        { name: "Status", uid: "status" },
    ];

    const [votes, setVotes] = useState([]);

    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [weekDates, setWeekDates] = useState(null);

    const [week, setWeek] = useState("31");
    const [year, setYear] = useState(new Set(["2022"]));

    const fetchVotes = async () => {

        if (isNaN(parseInt(week))) {
            return;
        }

        try {
            let path = `votes/${selectedYear}/${week}`
            let res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/${path}`)
    
            setVotes(res.data.votes)
            setWeekDates({monday: res.data.monday, sunday: res.data.sunday})
        } catch (error) {
            setMessage({type: "error", message: "Error " + error})
        }
    }

    useEffect(() => {
        // Set current week
        fetchVotes()
        
    }, [ week, year ])

    useEffect(() => {
        setWeek(getCurrentWeek())
    }, []);

    const selectedYear = useMemo(
        () => Array.from(year).join(", "),
        [year]
      );

    const changeYear = (value) => {
        setYear(value)
    }

  const renderCell = (vote, columnKey) => {
    const cellValue = vote[columnKey];
    switch (columnKey) {
    
        case "proposal_id":
            return renderPropIDCell(vote.proposal_id, vote.chain_id);

      case "status":

        // check vote direction
        switch (parseInt(vote.option)) {
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
      case "date":
        return new Date(cellValue).toLocaleDateString() + " " + new Date(cellValue).toLocaleTimeString();

      case "title":
        if (vote.proposal.title.length > 80) {
          return vote.proposal.title.substring(0, 80) + "..."
        };
        return vote.proposal.title;

      default:
        return cellValue;
    }
  };


    return (
        <Container xl>
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

            <Row gap={1} justify="flex-end" align="flex-end">
                <Col offset={11}>
                    
                </Col>
            </Row>
            <Spacer y={1} />


            <Grid.Container gap={1} >
                <Grid md={4}>
                    <Dropdown labelPlaceholder="Year">
                        <Dropdown.Button flat>{selectedYear}</Dropdown.Button>
                        <Dropdown.Menu aria-label="Year" selectionMode="single" onSelectionChange={changeYear} selectedKeys={year}>
                            <Dropdown.Item key="2022">2022</Dropdown.Item>
                            <Dropdown.Item key="2021">2021</Dropdown.Item>
                            <Dropdown.Item key="2020">2020</Dropdown.Item>
                            <Dropdown.Item key="2019">2019</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>

                    <Spacer y="1" />
                    <Input bordered labelPlaceholder="Week" color="primary" value={week} onChange={(e) => setWeek(e.target.value)} />

                    {weekDates && (
                        <>
                            <Spacer y="1" />
                            Showing votes between {new Date(weekDates.monday).toLocaleDateString()} and {new Date(weekDates.sunday).toLocaleDateString()}
                        </>
                    )}
                    
                </Grid>
                <Grid md={7}></Grid>
                <Grid md={1}>
                    <Link href="/">
                        <Button color="gradient" size="md" auto icon={<DocumentIcon fill="currentColor" filled="true" />} >Proposal List</Button>
                    </Link>
                </Grid>
            </Grid.Container>


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
                <Table.Body items={votes}>
                {(item) => (
                    <Table.Row key={item.chain_id + "-" + item.proposal_id}>
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

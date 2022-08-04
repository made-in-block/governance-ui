import { Container, Row, Spacer, Table, Col, Text, Button, Loading, Input, Dropdown, Grid } from "@nextui-org/react";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { StyledBadge } from "./components/styledBadge";
import { voteProposal } from "./libs/cosmos";
import { VoteOption } from "cosmjs-types/cosmos/gov/v1beta1/gov.js";
import { getChainInfo } from "./libs/chains";
import { DocumentIcon } from "./components/icons/documentIcon";
import { SwapIcon } from "./components/icons/swapIcon";
import { ChartIcon } from "./components/icons/chartIcon";
import Link from "next/link";
import { getWeekCount } from "./libs/weeks";

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

    const [week, setWeek] = useState(new Set(["31"]));
    const [weekCount, setWeekCount] = useState([]);
    const [year, setYear] = useState(new Set(["2022"]));

    const initWeeks = (_year) => {
        const weeks = [...Array(getWeekCount(_year)).keys()]
        
        setWeekCount(weeks.map((el, index) => {
            return {key: index+1, name: "W" + (index+1).toString().padStart(2, "0")}
        }))
    }

    const fetchVotes = async () => {
        let path = `votes/${selectedYear}/${selectedWeek}`
        let res = await axios.get(`http://127.0.0.1:3001/${path}`)

        setVotes(res.data.votes)
    }

    useEffect(() => {
        fetchVotes()
        initWeeks("2022")
    }, [])

    const selectedYear = useMemo(
        () => Array.from(year).join(", "),
        [year]
      );

    const selectedWeek = useMemo(
        () => Array.from(week).join(", "),
        [week]
      );

    const changeYear = (value) => {
        setYear(value)
        initWeeks(selectedYear)
    }

    const changeWeek = (value) => {
        setWeek(value)
        fetchVotes()
    }


  const renderCell = (vote, columnKey) => {
    const cellValue = vote[columnKey];
    switch (columnKey) {

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
                    <Link href="/">
                        <Button color="gradient" size="md" auto icon={<DocumentIcon fill="currentColor" filled="true" />} >Proposal List</Button>
                    </Link>
                </Col>
            </Row>
            <Spacer y={1} />


            <Grid.Container gap={1} >
                <Grid xs={1}>
                    <Dropdown>
                        <Dropdown.Button flat>{selectedYear}</Dropdown.Button>
                        <Dropdown.Menu aria-label="Year" selectionMode="single" onSelectionChange={changeYear} selectedKeys={year}>
                            <Dropdown.Item key="2022">2022</Dropdown.Item>
                            <Dropdown.Item key="2021">2021</Dropdown.Item>
                            <Dropdown.Item key="2020">2020</Dropdown.Item>
                            <Dropdown.Item key="2019">2019</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Grid>

                <Grid  xs={1}>
                    <Dropdown>
                        <Dropdown.Button flat>W{selectedWeek.padStart(2, "0")}</Dropdown.Button>
                        <Dropdown.Menu aria-label="Year" selectionMode="single" onSelectionChange={changeWeek} selectedKeys={year} items={weekCount}>
                        {(item) => (
                            <Dropdown.Item
                                key={item.key}
                                color={item.key === "delete" ? "error" : "default"}
                            >
                                {item.name}
                            </Dropdown.Item>
                            )}
                        </Dropdown.Menu>
                    </Dropdown>
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

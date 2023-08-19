"use client";
import { useEffect, useState, useContext, useCallback } from "react";
import { SocketContext } from "@/context/Socket";
import { useQuery } from "@tanstack/react-query";
import { Col, Row, Statistic } from "antd";
import { priceDisplay } from "@/utils/price";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { Chart } from "react-google-charts";

export default function Page({ params }) {
  const symbol = params.slug;
  const [ticker, setTicker] = useState([]);
  const [dataChart, setDataChart] = useState([["Day", "", "", "", ""]]);
  const { subscribe, messageHistory } = useContext(SocketContext);

  const { data, isLoading } = useQuery({
    queryKey: [`book_ticker_${symbol}`],
    queryFn: () =>
      fetch(
        `https://testnet.binance.vision/api/v3/ticker/24hr?symbol=${symbol}`
      ).then((res) => res.json()),
  });

  const lineQuery = useQuery({
    queryKey: [`line_${symbol}`],
    queryFn: () =>
      fetch(
        `https://testnet.binance.vision/api/v3/uiKlines?symbol=${symbol}&interval=5m&limit=10`
      ).then((res) => res.json()),
  });

  const lineData = lineQuery.data;

  const handleSubsribe = useCallback(
    (method) => {
      subscribe({
        method: method,
        params: [`${symbol.toLowerCase()}@ticker`],
        id: 1,
      });
    },
    [subscribe, symbol]
  );

  useEffect(() => {
    handleSubsribe("SUBSCRIBE");
    return () => {
      handleSubsribe("UNSUBSCRIBE");
    };
  }, [subscribe, symbol, handleSubsribe]);

  useEffect(() => {
    if (messageHistory?.data) {
      const streamData = JSON.parse(messageHistory?.data);
      if (streamData?.stream === `${symbol.toLowerCase()}@ticker`) {
        setTicker({
          lastPrice: streamData?.data.c,
          priceChangePercent: streamData?.data.P,
          lowPrice: streamData?.data.l,
          highPrice: streamData?.data.h,
          volume: streamData?.data.v,
          quoteVolume: streamData?.data.q,
        });
      }
    }
  }, [messageHistory, symbol]);

  useEffect(() => {
    setTicker(data);
  }, [data]);

  useEffect(() => {
    if (lineData) {
      const l = lineData.map((item) => [new Date(item[0]).toTimeString(), Number(item[3]), Number(item[1]), Number(item[4]), Number(item[2])]);
      setDataChart((prev) => [...prev, ...l]);
    }
  }, [lineData]);

  /**
   * 1 lower price
   * 2 open price
   * 3 closing price
   * 4 higer price
   */
  // const dataChart = [
  //   ["Day", "", "", "", ""],
  //   ["Mon", 20, 28, 38, 45],
  //   ["Tue", 31, 38, 55, 66],
  //   ["Wed", 50, 55, 77, 80],
  //   ["Thu", 77, 77, 66, 50],
  //   ["Fri", 68, 66, 22, 15],
  // ];

  const optionsChart = {
    legend: "none",
    bar: { groupWidth: "100%" }, // Remove space between bars.
    candlestick: {
      fallingColor: { strokeWidth: 0, fill: "#a52714" }, // red
      risingColor: { strokeWidth: 0, fill: "#0f9d58" }, // green
    },
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <strong>{symbol}</strong>
      <br />
      <br />
      <Row gutter={16}>
        <Col span={4}>
          <Statistic
            title="Last Price"
            value={priceDisplay(ticker?.lastPrice)}
          />
        </Col>
        <Col span={4}>
          <Statistic
            title="24h Change"
            value={ticker?.priceChangePercent}
            valueStyle={{
              color: ticker?.priceChangePercent >= 0 ? "#3f8600" : "#FF0000",
            }}
            prefix={
              ticker?.priceChangePercent >= 0 ? (
                <ArrowUpOutlined />
              ) : (
                <ArrowDownOutlined />
              )
            }
            suffix="%"
          />
        </Col>
        <Col span={4}>
          <Statistic title="Low" value={priceDisplay(ticker?.lowPrice)} />
        </Col>
        <Col span={4}>
          <Statistic title="High" value={priceDisplay(ticker?.highPrice)} />
        </Col>
        <Col span={4}>
          <Statistic title="Volume" value={priceDisplay(ticker?.volume)} />
        </Col>
        <Col span={4}>
          <Statistic title="Value" value={priceDisplay(ticker?.quoteVolume)} />
        </Col>
      </Row>

      <Chart
        chartType="CandlestickChart"
        width="100%"
        height="400px"
        data={dataChart}
        options={optionsChart}
      />
    </div>
  );
}

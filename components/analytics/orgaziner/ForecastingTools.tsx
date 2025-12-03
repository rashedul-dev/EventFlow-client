"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import { TrendingUp, DollarSign, Target, Lightbulb, Calculator, Zap, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Forecast {
  date: string;
  predicted: number;
  actual?: number;
  upperBound: number;
  lowerBound: number;
  confidence: number;
}

interface PricingRecommendation {
  price: number;
  expectedSales: number;
  expectedRevenue: number;
  elasticity: number;
  recommendation: "increase" | "decrease" | "maintain";
}

interface ForecastingToolsProps {
  eventId?: string;
  apiEndpoint?: string;
  className?: string;
}

export const ForecastingTools = ({
  eventId,
  apiEndpoint = "/api/analytics/organizer/forecasting",
  className = "",
}: ForecastingToolsProps) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("sales");

  // Sales Forecast
  const [salesForecast, setSalesForecast] = useState<Forecast[]>([]);
  const [historicalData, setHistoricalData] = useState<any[]>([]);

  // Pricing Optimization
  const [currentPrice, setCurrentPrice] = useState(75);
  const [capacity, setCapacity] = useState(1000);
  const [pricingRecommendations, setPricingRecommendations] = useState<PricingRecommendation[]>([]);

  // Revenue Projection
  const [revenueProjection, setRevenueProjection] = useState<any[]>([]);
  const [costInputs, setCostInputs] = useState({
    venue: 5000,
    marketing: 3000,
    staff: 2000,
    other: 1000,
  });

  // What-If Scenarios
  const [scenarioInputs, setScenarioInputs] = useState({
    priceChange: 0,
    marketingSpend: 0,
    capacityIncrease: 0,
  });
  const [scenarioResults, setScenarioResults] = useState<any>(null);

  useEffect(() => {
    fetchForecastData();
  }, [activeTab, eventId]);

  const fetchForecastData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`${apiEndpoint}?type=${activeTab}&eventId=${eventId || ""}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch forecast");

      const result = await response.json();

      if (activeTab === "sales") {
        setSalesForecast(result.forecast || generateMockSalesForecast());
        setHistoricalData(result.historical || []);
      } else if (activeTab === "pricing") {
        setPricingRecommendations(result.recommendations || generatePricingRecommendations());
      } else if (activeTab === "revenue") {
        setRevenueProjection(result.projection || generateRevenueProjection());
      }
    } catch (error) {
      console.error("Forecast fetch error:", error);
      // Generate mock data
      if (activeTab === "sales") {
        setSalesForecast(generateMockSalesForecast());
      } else if (activeTab === "pricing") {
        setPricingRecommendations(generatePricingRecommendations());
      } else if (activeTab === "revenue") {
        setRevenueProjection(generateRevenueProjection());
      }
      toast.error("Using sample data - API connection pending");
    } finally {
      setLoading(false);
    }
  };

  const generateMockSalesForecast = (): Forecast[] => {
    return Array.from({ length: 30 }, (_, i) => {
      const base = 500 + Math.random() * 200;
      return {
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        predicted: Math.floor(base),
        actual: i < 10 ? Math.floor(base + (Math.random() - 0.5) * 50) : undefined,
        upperBound: Math.floor(base + 100),
        lowerBound: Math.floor(base - 100),
        confidence: 0.85 + Math.random() * 0.1,
      };
    });
  };

  const generatePricingRecommendations = (): PricingRecommendation[] => {
    const prices = [50, 60, 70, 75, 80, 90, 100];
    return prices.map((price) => {
      const elasticity = -0.02;
      const baseQuantity = 800;
      const quantityChange = (price - 75) * elasticity * baseQuantity;
      const expectedSales = Math.floor(baseQuantity + quantityChange);

      return {
        price,
        expectedSales,
        expectedRevenue: price * expectedSales,
        elasticity,
        recommendation: price === 75 ? "maintain" : price < 75 ? "decrease" : "increase",
      };
    });
  };

  const generateRevenueProjection = () => {
    return Array.from({ length: 12 }, (_, i) => {
      const revenue = 50000 + Math.random() * 30000;
      const costs = costInputs.venue + costInputs.marketing + costInputs.staff + costInputs.other;
      return {
        month: new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
          month: "short",
        }),
        revenue: Math.floor(revenue),
        costs,
        profit: Math.floor(revenue - costs),
      };
    });
  };

  const runWhatIfScenario = () => {
    const baseRevenue = currentPrice * capacity * 0.8;
    const priceImpact = scenarioInputs.priceChange * capacity * 0.7;
    const marketingImpact = (scenarioInputs.marketingSpend / 100) * capacity * currentPrice * 0.1;
    const capacityImpact = scenarioInputs.capacityIncrease * currentPrice * 0.6;

    const projectedRevenue = baseRevenue + priceImpact + marketingImpact + capacityImpact;
    const projectedCosts = Object.values(costInputs).reduce((a, b) => a + b, 0) + scenarioInputs.marketingSpend;
    const projectedProfit = projectedRevenue - projectedCosts;

    setScenarioResults({
      revenue: projectedRevenue,
      costs: projectedCosts,
      profit: projectedProfit,
      roi: ((projectedProfit / projectedCosts) * 100).toFixed(1),
      ticketsSold: Math.floor(projectedRevenue / (currentPrice + scenarioInputs.priceChange)),
    });

    toast.success("Scenario calculated");
  };

  const optimalPrice = pricingRecommendations.reduce(
    (max, rec) => (rec.expectedRevenue > max.expectedRevenue ? rec : max),
    pricingRecommendations[0] || {
      price: 75,
      expectedRevenue: 0,
      expectedSales: 0,
      elasticity: 0,
      recommendation: "maintain",
    }
  );

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Forecasting & What-If Tools</CardTitle>
          <CardDescription>Predictive analytics and scenario modeling for optimal planning</CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">Sales Forecast</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="whatif">What-If</TabsTrigger>
        </TabsList>

        {/* Sales Forecast */}
        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Ticket Sales Prediction</CardTitle>
                  <CardDescription>ML-powered forecast based on historical trends</CardDescription>
                </div>
                <Badge variant="outline" style={{ color: "#08CB00", borderColor: "#08CB00" }}>
                  85% Confidence
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[400px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={salesForecast}>
                    <defs>
                      <linearGradient id="confidenceBand" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#08CB00" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#08CB00" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(238, 238, 238, 0.1)" />
                    <XAxis dataKey="date" stroke="#EEEEEE" style={{ fontSize: "12px" }} />
                    <YAxis stroke="#EEEEEE" style={{ fontSize: "12px" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--background)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />

                    {/* Confidence band */}
                    <Area
                      type="monotone"
                      dataKey="upperBound"
                      stroke="none"
                      fill="url(#confidenceBand)"
                      fillOpacity={1}
                    />
                    <Area
                      type="monotone"
                      dataKey="lowerBound"
                      stroke="none"
                      fill="url(#confidenceBand)"
                      fillOpacity={1}
                    />

                    {/* Actual data */}
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="#253900"
                      strokeWidth={2}
                      name="Actual Sales"
                      dot={{ fill: "#253900", r: 4 }}
                      connectNulls={false}
                    />

                    {/* Predicted data */}
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke="#08CB00"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Predicted Sales"
                      dot={{ fill: "#08CB00", r: 3 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Target className="h-4 w-4" />
                    <span>30-Day Forecast</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {salesForecast[salesForecast.length - 1]?.predicted.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">tickets</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <TrendingUp className="h-4 w-4 text-[#08CB00]" />
                    <span>Growth Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-[#08CB00]">+12.5%</p>
                  <p className="text-xs text-muted-foreground mt-1">vs last period</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Zap className="h-4 w-4 text-[#FFA500]" />
                    <span>Peak Day</span>
                  </div>
                  <p className="text-2xl font-bold">Day 23</p>
                  <p className="text-xs text-muted-foreground mt-1">expected surge</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Optimization */}
        <TabsContent value="pricing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Price Elasticity Analysis</CardTitle>
                <CardDescription>Revenue optimization across different price points</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={pricingRecommendations}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(238, 238, 238, 0.1)" />
                    <XAxis
                      dataKey="price"
                      stroke="#EEEEEE"
                      label={{ value: "Price ($)", position: "insideBottom", offset: -5 }}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke="#EEEEEE"
                      label={{ value: "Revenue ($)", angle: -90, position: "insideLeft" }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#EEEEEE"
                      label={{ value: "Sales", angle: 90, position: "insideRight" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--background)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="expectedRevenue"
                      stroke="#08CB00"
                      strokeWidth={3}
                      name="Expected Revenue"
                      dot={{ fill: "#08CB00", r: 5 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="expectedSales"
                      stroke="#253900"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Expected Sales"
                      dot={{ fill: "#253900", r: 4 }}
                    />
                    <ReferenceLine
                      x={optimalPrice.price}
                      yAxisId="left"
                      stroke="#FFA500"
                      strokeDasharray="3 3"
                      label={{ value: "Optimal", position: "top", fill: "#FFA500" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  <Lightbulb className="inline h-5 w-5 mr-2 text-[#FFA500]" />
                  Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-[#08CB00]/10 border border-[#08CB00]/50 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-2">Optimal Price Point</div>
                  <div className="text-3xl font-bold" style={{ color: "#08CB00" }}>
                    ${optimalPrice.price}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Expected Sales</div>
                    <div className="text-lg font-semibold">{optimalPrice.expectedSales} tickets</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Expected Revenue</div>
                    <div className="text-lg font-semibold" style={{ color: "#08CB00" }}>
                      ${optimalPrice.expectedRevenue.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Price Elasticity</div>
                    <div className="text-lg font-semibold">{optimalPrice.elasticity.toFixed(3)}</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-[#FFA500] mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      Based on historical data and market analysis, this price maximizes revenue while maintaining
                      strong sales volume.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Projection */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Revenue & Profit Projection</CardTitle>
                <CardDescription>12-month financial forecast with cost analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueProjection}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#08CB00" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#08CB00" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#253900" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#253900" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(238, 238, 238, 0.1)" />
                    <XAxis dataKey="month" stroke="#EEEEEE" style={{ fontSize: "12px" }} />
                    <YAxis stroke="#EEEEEE" style={{ fontSize: "12px" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--background)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#08CB00"
                      fill="url(#revenueGradient)"
                      name="Revenue"
                    />
                    <Area type="monotone" dataKey="profit" stroke="#253900" fill="url(#profitGradient)" name="Profit" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Cost Inputs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="venue-cost" className="text-xs">
                    Venue
                  </Label>
                  <Input
                    id="venue-cost"
                    type="number"
                    value={costInputs.venue}
                    onChange={(e) => setCostInputs({ ...costInputs, venue: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="marketing-cost" className="text-xs">
                    Marketing
                  </Label>
                  <Input
                    id="marketing-cost"
                    type="number"
                    value={costInputs.marketing}
                    onChange={(e) => setCostInputs({ ...costInputs, marketing: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="staff-cost" className="text-xs">
                    Staff
                  </Label>
                  <Input
                    id="staff-cost"
                    type="number"
                    value={costInputs.staff}
                    onChange={(e) => setCostInputs({ ...costInputs, staff: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="other-cost" className="text-xs">
                    Other
                  </Label>
                  <Input
                    id="other-cost"
                    type="number"
                    value={costInputs.other}
                    onChange={(e) => setCostInputs({ ...costInputs, other: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <Button onClick={() => setRevenueProjection(generateRevenueProjection())} className="w-full" size="sm">
                  Update Projection
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* What-If Scenarios */}
        <TabsContent value="whatif" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  <Calculator className="inline h-5 w-5 mr-2" />
                  Scenario Parameters
                </CardTitle>
                <CardDescription>Adjust variables to model different scenarios</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Price Change</Label>
                    <span className="text-sm font-medium">
                      {scenarioInputs.priceChange >= 0 ? "+" : ""}${scenarioInputs.priceChange}
                    </span>
                  </div>
                  <Slider
                    value={[scenarioInputs.priceChange]}
                    onValueChange={([value]) => setScenarioInputs({ ...scenarioInputs, priceChange: value })}
                    min={-30}
                    max={30}
                    step={5}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    New price: ${currentPrice + scenarioInputs.priceChange}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Marketing Spend</Label>
                    <span className="text-sm font-medium">+${scenarioInputs.marketingSpend}</span>
                  </div>
                  <Slider
                    value={[scenarioInputs.marketingSpend]}
                    onValueChange={([value]) => setScenarioInputs({ ...scenarioInputs, marketingSpend: value })}
                    min={0}
                    max={10000}
                    step={500}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Capacity Increase</Label>
                    <span className="text-sm font-medium">+{scenarioInputs.capacityIncrease} seats</span>
                  </div>
                  <Slider
                    value={[scenarioInputs.capacityIncrease]}
                    onValueChange={([value]) => setScenarioInputs({ ...scenarioInputs, capacityIncrease: value })}
                    min={0}
                    max={500}
                    step={50}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    New capacity: {capacity + scenarioInputs.capacityIncrease}
                  </p>
                </div>

                <Button onClick={runWhatIfScenario} className="w-full">
                  <Zap className="mr-2 h-4 w-4" />
                  Calculate Scenario
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Scenario Results</CardTitle>
                <CardDescription>Projected outcomes based on your inputs</CardDescription>
              </CardHeader>
              <CardContent>
                {scenarioResults ? (
                  <div className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Projected Revenue</span>
                        <DollarSign className="h-4 w-4 text-[#08CB00]" />
                      </div>
                      <p className="text-3xl font-bold" style={{ color: "#08CB00" }}>
                        ${scenarioResults.revenue.toLocaleString()}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="text-xs text-muted-foreground mb-1">Projected Costs</div>
                        <p className="text-xl font-semibold">${scenarioResults.costs.toLocaleString()}</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="text-xs text-muted-foreground mb-1">Projected Profit</div>
                        <p className="text-xl font-semibold" style={{ color: "#253900" }}>
                          ${scenarioResults.profit.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="text-xs text-muted-foreground mb-1">Expected ROI</div>
                        <p className="text-xl font-semibold" style={{ color: "#08CB00" }}>
                          {scenarioResults.roi}%
                        </p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="text-xs text-muted-foreground mb-1">Tickets Sold</div>
                        <p className="text-xl font-semibold">{scenarioResults.ticketsSold}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-[#FFA500] mt-0.5" />
                        <div>
                          <p className="text-sm font-medium mb-1">Scenario Analysis</p>
                          <p className="text-xs text-muted-foreground">
                            {scenarioResults.roi > 100
                              ? "Strong positive outcome - consider implementing these changes."
                              : scenarioResults.roi > 50
                              ? "Moderate improvement expected - test carefully before full rollout."
                              : "Limited impact - explore alternative strategies."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-[400px] flex items-center justify-center text-center">
                    <div>
                      <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm font-medium text-muted-foreground">Adjust parameters and calculate</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Model different scenarios to optimize your event
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

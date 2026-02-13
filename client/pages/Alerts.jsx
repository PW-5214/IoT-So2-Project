import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Bell, AlertTriangle, AlertCircle, Info, CheckCircle2, X, Clock, Thermometer, Droplets, Sprout } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Alerts() {
  const API_URL = "/api";
  
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState("all"); // all, critical, high, medium, low
  const [loading, setLoading] = useState(true);
  
  // Fetch alerts from MongoDB
  const fetchAlerts = async () => {
    try {
      const response = await fetch(`${API_URL}/alerts`);
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setLoading(false);
    }
  };
  
  // Acknowledge alert
  const acknowledgeAlert = async (alertId) => {
    try {
      const response = await fetch(`${API_URL}/alerts/${alertId}/acknowledge`, {
        method: 'POST'
      });
      if (response.ok) {
        fetchAlerts(); // Refresh alerts
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };
  
  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);
  
  // Filter alerts
  const filteredAlerts = filter === "all" 
    ? alerts 
    : alerts.filter(alert => alert.severity === filter);
  
  // Get severity config
  const getSeverityConfig = (severity) => {
    switch(severity) {
      case "critical":
        return {
          bg: "bg-red-500/10",
          border: "border-red-500/30",
          text: "text-red-500",
          icon: AlertTriangle,
          label: "Critical"
        };
      case "high":
        return {
          bg: "bg-orange-500/10",
          border: "border-orange-500/30",
          text: "text-orange-500",
          icon: AlertCircle,
          label: "High"
        };
      case "medium":
        return {
          bg: "bg-yellow-500/10",
          border: "border-yellow-500/30",
          text: "text-yellow-500",
          icon: Info,
          label: "Medium"
        };
      default:
        return {
          bg: "bg-blue-500/10",
          border: "border-blue-500/30",
          text: "text-blue-500",
          icon: Info,
          label: "Low"
        };
    }
  };
  
  // Get alert icon by type
  const getAlertIcon = (type) => {
    if (!type) return AlertTriangle;
    if (type.includes("TEMPERATURE")) return Thermometer;
    if (type.includes("HUMIDITY")) return Droplets;
    if (type.includes("SOIL")) return Sprout;
    return AlertTriangle;
  };
  
  // Count by severity
  const counts = {
    all: alerts.length,
    critical: alerts.filter(a => a.severity === "critical").length,
    high: alerts.filter(a => a.severity === "high").length,
    medium: alerts.filter(a => a.severity === "medium").length,
    low: alerts.filter(a => a.severity === "low").length,
  };
  
  return (
    <Layout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 bg-background">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1 flex items-center gap-3">
            <Bell className="w-8 h-8 text-accent" />
            Alerts & Events
            {counts.critical > 0 && (
              <span className="px-3 py-1 text-xs font-bold bg-red-500 text-white rounded-full">
                {counts.critical} Critical
              </span>
            )}
          </h1>
          <p className="text-muted-foreground text-sm">
            Real-time alerts from MongoDB Atlas • Threshold monitoring system
          </p>
        </div>
        
        {/* Alert Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "bg-card rounded-lg border-2 p-4 transition-all",
              filter === "all" ? "border-accent shadow-lg" : "border-border/60 hover:border-accent/50"
            )}
          >
            <p className="text-xs text-muted-foreground mb-1">Total Alerts</p>
            <p className="text-3xl font-bold text-foreground">{counts.all}</p>
          </button>
          <button
            onClick={() => setFilter("critical")}
            className={cn(
              "bg-card rounded-lg border-2 p-4 transition-all",
              filter === "critical" ? "border-red-500 shadow-lg" : "border-border/60 hover:border-red-500/50"
            )}
          >
            <p className="text-xs text-muted-foreground mb-1">Critical</p>
            <p className="text-3xl font-bold text-red-500">{counts.critical}</p>
          </button>
          <button
            onClick={() => setFilter("high")}
            className={cn(
              "bg-card rounded-lg border-2 p-4 transition-all",
              filter === "high" ? "border-orange-500 shadow-lg" : "border-border/60 hover:border-orange-500/50"
            )}
          >
            <p className="text-xs text-muted-foreground mb-1">High</p>
            <p className="text-3xl font-bold text-orange-500">{counts.high}</p>
          </button>
          <button
            onClick={() => setFilter("medium")}
            className={cn(
              "bg-card rounded-lg border-2 p-4 transition-all",
              filter === "medium" ? "border-yellow-500 shadow-lg" : "border-border/60 hover:border-yellow-500/50"
            )}
          >
            <p className="text-xs text-muted-foreground mb-1">Medium</p>
            <p className="text-3xl font-bold text-yellow-500">{counts.medium}</p>
          </button>
          <button
            onClick={() => setFilter("low")}
            className={cn(
              "bg-card rounded-lg border-2 p-4 transition-all",
              filter === "low" ? "border-blue-500 shadow-lg" : "border-border/60 hover:border-blue-500/50"
            )}
          >
            <p className="text-xs text-muted-foreground mb-1">Low</p>
            <p className="text-3xl font-bold text-blue-500">{counts.low}</p>
          </button>
        </div>
        
        {/* Alerts List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full mx-auto"></div>
              <p className="text-muted-foreground mt-4">Loading alerts...</p>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="bg-card rounded-xl border border-border/60 p-12 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">No Alerts Found</h3>
              <p className="text-muted-foreground">
                {filter === "all" 
                  ? "All systems operational. No alerts detected."
                  : `No ${filter} severity alerts at this time.`}
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const config = getSeverityConfig(alert.severity);
              const Icon = config.icon;
              const TypeIcon = getAlertIcon(alert.alertType);
              
              return (
                <div
                  key={alert._id}
                  className={cn(
                    "bg-card rounded-xl border-2 p-6 shadow-md transition-all",
                    config.border,
                    config.bg
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={cn("p-3 rounded-lg", config.bg)}>
                        <Icon className={cn("w-6 h-6", config.text)} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={cn(
                            "px-2 py-1 rounded text-xs font-bold",
                            config.bg,
                            config.text
                          )}>
                            {config.label.toUpperCase()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {alert.alertType?.replace(/_/g, ' ') || 'Unknown'}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-2">
                          {alert.message}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">Device</p>
                            <p className="font-semibold text-foreground">{alert.deviceId}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Value</p>
                            <p className="font-semibold text-foreground">{alert.value}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Threshold</p>
                            <p className="font-semibold text-foreground">{alert.threshold}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Time</p>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <p className="font-semibold text-foreground">
                                {new Date(alert.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {alert.acknowledged ? (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-2 text-center">
                          <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto mb-1" />
                          <p className="text-xs font-semibold text-green-500">Acknowledged</p>
                          {alert.acknowledgedBy && (
                            <p className="text-xs text-muted-foreground mt-1">by {alert.acknowledgedBy}</p>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => acknowledgeAlert(alert._id)}
                          className="bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                        >
                          Acknowledge
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
}

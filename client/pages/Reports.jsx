import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Download, FileText, FileSpreadsheet, Calendar, Database, TrendingUp, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function Reports() {
  const API_URL = "/api/sensors";
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exportStatus, setExportStatus] = useState("");
  const [timeRange, setTimeRange] = useState("24");
  
  // Fetch statistics
  const fetchStats = async (hours = 24) => {
    try {
      const response = await fetch(`${API_URL}/stats?hours=${hours}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };
  
  useEffect(() => {
    fetchStats(parseInt(timeRange));
  }, [timeRange]);
  
  // Export to CSV
  const exportToCSV = async () => {
    setLoading(true);
    setExportStatus("Generating CSV...");
    try {
      const response = await fetch(`${API_URL}/history?hours=${timeRange}&limit=10000`);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Backend returns 'data' not 'readings'
      const readings = data.data || data.readings || [];
      
      if (!readings || readings.length === 0) {
        throw new Error("No data available for export");
      }
      
      // Create CSV content
      let csv = 'Timestamp,Temperature (°C),Humidity (%),Soil Moisture (%),Device ID\n';
      readings.forEach(reading => {
        csv += `${new Date(reading.timestamp).toLocaleString()},${reading.temperature},${reading.humidity},${reading.soilMoisture},${reading.deviceId || 'NodeMCU_001'}\n`;
      });
      
      // Download CSV
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sensor-data-${timeRange}h-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setExportStatus(`✅ Exported ${readings.length} records to CSV`);
      setTimeout(() => setExportStatus(""), 3000);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      setExportStatus(`❌ Export failed: ${error.message}`);
      setTimeout(() => setExportStatus(""), 5000);
    }
    setLoading(false);
  };
  
  // Export to PDF
  const exportToPDF = async () => {
    setLoading(true);
    setExportStatus("Generating PDF...");
    try {
      // Fetch data
      const response = await fetch(`${API_URL}/history?hours=${timeRange}&limit=100`);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      const data = await response.json();
      
      const statsResponse = await fetch(`${API_URL}/stats?hours=${timeRange}`);
      if (!statsResponse.ok) {
        throw new Error(`Stats API Error: ${statsResponse.status}`);
      }
      const statsData = await statsResponse.json();
      
      // Backend returns 'data' not 'readings'
      const readings = data.data || data.readings || [];
      
      if (!readings || readings.length === 0) {
        throw new Error("No data available for export");
      }
      
      if (!statsData.stats) {
        throw new Error("Statistics data not available");
      }
      
      const doc = new jsPDF();
      const stats = statsData.stats;
      
      // Header with logo area
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, 220, 35, 'F');
      
      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont(undefined, 'bold');
      doc.text('IoT Sensor Monitoring Report', 14, 15);
      
      // Subtitle
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);
      doc.text(`Time Range: Last ${timeRange} Hours | Total Readings: ${stats.count}`, 14, 28);
      
      // Reset text color
      doc.setTextColor(0, 0, 0);
      
      // Statistics Summary Section
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('Statistics Summary', 14, 45);
      
      // Statistics boxes
      const boxY = 52;
      const boxHeight = 28;
      
      // Temperature box
      doc.setFillColor(239, 68, 68);
      doc.setGState(new doc.GState({opacity: 0.1}));
      doc.rect(14, boxY, 60, boxHeight, 'F');
      doc.setGState(new doc.GState({opacity: 1.0}));
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text('Temperature (C)', 17, boxY + 6);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      doc.text(`Current: ${stats.avgTemperature.toFixed(1)}C`, 17, boxY + 12);
      doc.text(`Min: ${stats.minTemperature.toFixed(1)}C`, 17, boxY + 17);
      doc.text(`Max: ${stats.maxTemperature.toFixed(1)}C`, 17, boxY + 22);
      doc.text(`Avg: ${stats.avgTemperature.toFixed(1)}C`, 17, boxY + 27);
      
      // Humidity box
      doc.setFillColor(59, 130, 246);
      doc.setGState(new doc.GState({opacity: 0.1}));
      doc.rect(77, boxY, 60, boxHeight, 'F');
      doc.setGState(new doc.GState({opacity: 1.0}));
      doc.setFont(undefined, 'bold');
      doc.setFontSize(10);
      doc.text('Humidity (%)', 80, boxY + 6);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      doc.text(`Current: ${stats.avgHumidity.toFixed(1)}%`, 80, boxY + 12);
      doc.text(`Min: ${stats.minHumidity.toFixed(1)}%`, 80, boxY + 17);
      doc.text(`Max: ${stats.maxHumidity.toFixed(1)}%`, 80, boxY + 22);
      doc.text(`Avg: ${stats.avgHumidity.toFixed(1)}%`, 80, boxY + 27);
      
      // Soil Moisture box
      doc.setFillColor(16, 185, 129);
      doc.setGState(new doc.GState({opacity: 0.1}));
      doc.rect(140, boxY, 60, boxHeight, 'F');
      doc.setGState(new doc.GState({opacity: 1.0}));
      doc.setFont(undefined, 'bold');
      doc.setFontSize(10);
      doc.text('Soil Moisture (%)', 143, boxY + 6);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      doc.text(`Current: ${stats.avgSoilMoisture.toFixed(1)}%`, 143, boxY + 12);
      doc.text(`Min: ${stats.minSoilMoisture.toFixed(0)}%`, 143, boxY + 17);
      doc.text(`Max: ${stats.maxSoilMoisture.toFixed(0)}%`, 143, boxY + 22);
      doc.text(`Avg: ${stats.avgSoilMoisture.toFixed(1)}%`, 143, boxY + 27);
      
      // Data Table Section
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('Recent Readings', 14, 92);
      
      const tableData = readings.slice(0, 50).map(reading => [
        new Date(reading.timestamp).toLocaleString(),
        reading.temperature.toFixed(1),
        reading.humidity.toFixed(1),
        reading.soilMoisture.toFixed(0),
        reading.deviceId || 'NodeMCU_001'
      ]);
      
      doc.autoTable({
        startY: 97,
        head: [['Timestamp', 'Temp (C)', 'Humidity (%)', 'Soil (%)', 'Device']],
        body: tableData,
        theme: 'striped',
        headStyles: { 
          fillColor: [59, 130, 246],
          fontSize: 9,
          fontStyle: 'bold'
        },
        styles: { 
          fontSize: 8,
          cellPadding: 2
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250]
        }
      });
      
      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128);
        doc.text(
          `Page ${i} of ${pageCount} | IoT Sensor Monitoring System | (c) ${new Date().getFullYear()}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }
      
      doc.save(`sensor-report-${timeRange}h-${new Date().toISOString().split('T')[0]}.pdf`);
      
      setExportStatus(`✅ PDF report generated successfully`);
      setTimeout(() => setExportStatus(""), 3000);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setExportStatus(`❌ PDF generation failed: ${error.message}`);
      setTimeout(() => setExportStatus(""), 5000);
    }
    setLoading(false);
  };
  
  return (
    <Layout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 bg-background">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">
            Reports & Data Export
          </h1>
          <p className="text-muted-foreground text-sm">
            Generate comprehensive reports and export sensor data in multiple formats
          </p>
        </div>
        
        {/* Time Range Selector */}
        <div className="bg-card rounded-xl border border-border/60 p-6 shadow-md">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accent" />
            Select Time Range
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['24', '48', '168', '720'].map((hours) => (
              <button
                key={hours}
                onClick={() => setTimeRange(hours)}
                className={cn(
                  "px-6 py-4 rounded-lg border-2 transition-all font-semibold",
                  timeRange === hours
                    ? "bg-accent text-white border-accent shadow-lg"
                    : "bg-card border-border hover:border-accent/50"
                )}
              >
                Last {hours === '24' ? '24 Hours' : hours === '48' ? '2 Days' : hours === '168' ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>
        </div>
        
        {/* Statistics Overview */}
        {stats && (
          <div className="bg-card rounded-xl border border-border/60 p-6 shadow-md">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-accent" />
              Data Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg p-4 border border-blue-500/20">
                <p className="text-sm text-muted-foreground mb-1">Total Readings</p>
                <p className="text-3xl font-bold text-foreground">{stats.count.toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 rounded-lg p-4 border border-red-500/20">
                <p className="text-sm text-muted-foreground mb-1">Avg Temperature</p>
                <p className="text-3xl font-bold text-foreground">{stats.avgTemperature.toFixed(1)}°C</p>
              </div>
              <div className="bg-gradient-to-br from-blue-400/10 to-blue-400/5 rounded-lg p-4 border border-blue-400/20">
                <p className="text-sm text-muted-foreground mb-1">Avg Humidity</p>
                <p className="text-3xl font-bold text-foreground">{stats.avgHumidity.toFixed(1)}%</p>
              </div>
              <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg p-4 border border-green-500/20">
                <p className="text-sm text-muted-foreground mb-1">Avg Soil Moisture</p>
                <p className="text-3xl font-bold text-foreground">{stats.avgSoilMoisture.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Export Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CSV Export */}
          <div className="bg-card rounded-xl border border-border/60 p-6 shadow-md hover:shadow-lg transition-all">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <FileSpreadsheet className="w-8 h-8 text-green-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-2">Export to CSV</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Download raw sensor data in CSV format. Perfect for data analysis in Excel, Google Sheets, or Python.
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 mb-4">
                  <li>• All timestamps with exact values</li>
                  <li>• Compatible with spreadsheet software</li>
                  <li>• Up to 10,000 readings</li>
                  <li>• Includes device ID and location</li>
                </ul>
                <button
                  onClick={exportToCSV}
                  disabled={loading}
                  className={cn(
                    "w-full px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2",
                    loading 
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg"
                  )}
                >
                  <Download className="w-4 h-4" />
                  {loading ? "Generating..." : "Download CSV"}
                </button>
              </div>
            </div>
          </div>
          
          {/* PDF Export */}
          <div className="bg-card rounded-xl border border-border/60 p-6 shadow-md hover:shadow-lg transition-all">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-500/10 rounded-lg">
                <FileText className="w-8 h-8 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-2">Export to PDF</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate professional PDF report with statistics and recent readings. Ideal for presentations and documentation.
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 mb-4">
                  <li>• Professional formatted report</li>
                  <li>• Statistics summary with charts</li>
                  <li>• Recent 50 readings in table</li>
                  <li>• Ready for printing/sharing</li>
                </ul>
                <button
                  onClick={exportToPDF}
                  disabled={loading}
                  className={cn(
                    "w-full px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2",
                    loading 
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg"
                  )}
                >
                  <Download className="w-4 h-4" />
                  {loading ? "Generating..." : "Download PDF"}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Export Status */}
        {exportStatus && (
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 text-center">
            <p className="text-sm font-semibold text-foreground">{exportStatus}</p>
          </div>
        )}
        
        {/* Quick Stats Grid */}
        {stats && (
          <div className="bg-card rounded-xl border border-border/60 p-6 shadow-md">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              Detailed Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Temperature */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">Temperature Range</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Minimum</span>
                    <span className="text-sm font-bold text-blue-500">{stats.minTemperature.toFixed(1)}°C</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Average</span>
                    <span className="text-sm font-bold text-foreground">{stats.avgTemperature.toFixed(1)}°C</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Maximum</span>
                    <span className="text-sm font-bold text-red-500">{stats.maxTemperature.toFixed(1)}°C</span>
                  </div>
                </div>
              </div>
              
              {/* Humidity */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">Humidity Range</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Minimum</span>
                    <span className="text-sm font-bold text-blue-500">{stats.minHumidity.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Average</span>
                    <span className="text-sm font-bold text-foreground">{stats.avgHumidity.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Maximum</span>
                    <span className="text-sm font-bold text-red-500">{stats.maxHumidity.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              
              {/* Soil Moisture */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">Soil Moisture Range</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Minimum</span>
                    <span className="text-sm font-bold text-blue-500">{stats.minSoilMoisture.toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Average</span>
                    <span className="text-sm font-bold text-foreground">{stats.avgSoilMoisture.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Maximum</span>
                    <span className="text-sm font-bold text-red-500">{stats.maxSoilMoisture.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

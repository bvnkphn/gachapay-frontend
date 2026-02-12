import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Filter, Search, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PageTransition from "@/components/PageTransition";
import { mockOrders, Order, getStatusColor, getStatusText } from "@/data/orders";
import { cn } from "@/lib/utils";

const History = () => {
  const [orders] = useState<Order[]>(mockOrders);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.gameName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <PageTransition>
      <div className="min-h-screen pt-20 pb-24">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Clock className="w-6 h-6 text-primary" />
              ประวัติการเติม
            </h1>
            <p className="text-muted-foreground mt-1">
              ดูรายการเติมเงินทั้งหมดของคุณ
            </p>
          </div>

          {/* Filters */}
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหา Order ID หรือเกม..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="สถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="completed">สำเร็จ</SelectItem>
                <SelectItem value="processing">กำลังดำเนินการ</SelectItem>
                <SelectItem value="pending">รอดำเนินการ</SelectItem>
                <SelectItem value="failed">ล้มเหลว</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Orders List */}
          <div className="space-y-3">
            {filteredOrders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card rounded-xl p-8 text-center"
              >
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold mb-1">ไม่พบรายการ</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery || filterStatus !== "all"
                    ? "ลองเปลี่ยนตัวกรองหรือคำค้นหา"
                    : "คุณยังไม่มีประวัติการเติมเงิน"}
                </p>
              </motion.div>
            ) : (
              filteredOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedOrder(order)}
                  className="glass-card rounded-xl p-4 cursor-pointer hover:glow-primary transition-all"
                >
                  <div className="flex items-center gap-4">
                    {/* Game Image */}
                    <img
                      src={order.gameImage}
                      alt={order.gameName}
                      className="w-14 h-14 rounded-xl object-cover"
                    />

                    {/* Order Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold truncate">{order.gameName}</p>
                        <span
                          className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded-full",
                            order.status === "completed" && "bg-success/20 text-success",
                            order.status === "processing" && "bg-primary/20 text-primary",
                            order.status === "pending" && "bg-warning/20 text-warning",
                            order.status === "failed" && "bg-destructive/20 text-destructive"
                          )}
                        >
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {order.packageName}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </span>
                        <span className="text-sm font-semibold text-primary">
                          ฿{order.price}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="glass-card border-border/50">
          <DialogHeader>
            <DialogTitle>รายละเอียดคำสั่งซื้อ</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">สถานะ</span>
                <span
                  className={cn(
                    "font-medium px-3 py-1 rounded-full text-sm",
                    selectedOrder.status === "completed" && "bg-success/20 text-success",
                    selectedOrder.status === "processing" && "bg-primary/20 text-primary",
                    selectedOrder.status === "pending" && "bg-warning/20 text-warning",
                    selectedOrder.status === "failed" && "bg-destructive/20 text-destructive"
                  )}
                >
                  {getStatusText(selectedOrder.status)}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-mono text-sm">{selectedOrder.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">เกม</span>
                  <span>{selectedOrder.gameName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">แพ็คเกจ</span>
                  <span>{selectedOrder.packageName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Player ID</span>
                  <span className="font-mono">{selectedOrder.playerId}</span>
                </div>
                {selectedOrder.server && (
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Server</span>
                    <span>{selectedOrder.server}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">ช่องทางชำระเงิน</span>
                  <span>{selectedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">วันที่สั่งซื้อ</span>
                  <span>{formatDate(selectedOrder.createdAt)}</span>
                </div>
                {selectedOrder.completedAt && (
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">วันที่สำเร็จ</span>
                    <span>{formatDate(selectedOrder.completedAt)}</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center p-4 rounded-lg bg-primary/10 border border-primary/30">
                <span className="font-medium">ยอดชำระ</span>
                <span className="text-xl font-bold text-primary">
                  ฿{selectedOrder.price}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedOrder(null)}>
                  ปิด
                </Button>
                {selectedOrder.status === "failed" && (
                  <Button className="flex-1 bg-gradient-cyber">
                    ลองอีกครั้ง
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
};

export default History;

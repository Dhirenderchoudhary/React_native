import React, { useEffect, useRef } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Icon, type IconName } from "@/core/ui/Icon";
import { colors, type } from "@/core/theme";
import { EVENT_META, type LiveEvent } from "@/shared/driveStore";

export type EventFeedProps = {
  events: LiveEvent[];
};

export function EventFeed({ events }: EventFeedProps) {
  const listRef = useRef<ScrollView>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ y: 0, animated: true });
  }, [events.length]);

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={[type.micro, styles.header]}>Live Feed</Text>
        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={[type.micro, styles.liveText]}>Live</Text>
        </View>
      </View>
      <ScrollView
        ref={listRef}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {events.length === 0 ? (
          <EmptyRow />
        ) : (
          events.map((e) => <EventRow key={e.id} event={e} />)
        )}
      </ScrollView>
    </View>
  );
}

function EmptyRow() {
  return (
    <View style={[styles.row, styles.rowRecessed]}>
      <View style={styles.rowInner}>
        <View style={[styles.iconCircle, styles.iconCircleRecessed]}>
          <Icon name="check" size={18} color={colors.status.success} />
        </View>
        <Text style={[type.caption, { color: colors.ink.secondary }]}>
          Monitoring speed...
        </Text>
      </View>
    </View>
  );
}

function EventRow({ event }: { event: LiveEvent }) {
  const meta = EVENT_META[event.type];
  const danger = event.severity !== "light";
  return (
    <View style={[styles.row, styles.rowRaised]}>
      <View style={styles.topBevel} />
      <View style={styles.rowInner}>
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: danger ? "rgba(147,0,10,0.18)" : colors.bg.raised,
              borderColor: danger ? "rgba(239,91,91,0.55)" : colors.line.soft,
            },
          ]}
        >
          <Icon
            name={danger ? "warning" : (meta.icon as IconName)}
            size={18}
            color={danger ? "#ffdad6" : colors.ink.primary}
          />
        </View>
        <Text
          style={[type.bodyStrong, { color: colors.ink.primary, flex: 1 }]}
          numberOfLines={1}
        >
          {meta.label}
        </Text>
        <Text
          style={[
            type.bodyStrong,
            { color: danger ? colors.status.danger : colors.status.warning },
          ]}
        >
          {event.penalty}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    minHeight: 0,
    gap: 12,
    padding: 12,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line.soft,
    backgroundColor: colors.bg.surface,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  header: {
    color: colors.ink.primary,
    paddingLeft: 2,
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.status.successDim,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.status.success,
  },
  liveText: {
    color: colors.status.success,
    fontSize: 9,
    lineHeight: 10,
  },
  list: {
    flex: 1,
    minHeight: 0,
  },
  listContent: {
    gap: 8,
    paddingBottom: 4,
  },
  row: {
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    overflow: "hidden",
    position: "relative",
  },
  rowRaised: {
    backgroundColor: colors.bg.raised,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line.soft,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  rowRecessed: {
    backgroundColor: colors.bg.raised,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line.soft,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  topBevel: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  rowInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconCircleRecessed: {
    backgroundColor: colors.bg.raised,
    borderColor: "rgba(255,255,255,0.06)",
  },
});

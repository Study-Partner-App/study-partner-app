import React, { useEffect, useState } from "react";
import {View, Text, Pressable, ScrollView, Button} from "react-native";
import { router } from "expo-router";
import { styles } from "@/app/_styles/globalStyles";
import { User } from "../matching/_utils";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "@/lib/theme";

export default function Home() {

  const [friendReqCount, setFriendReqCount] = useState(0);
  const [publicSessionCount, setPubSessCount] = useState(0);
  const [matches, setMatches] = useState<User[]>([]);

  const loadDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if(!user) return;

    // Count Number of Friend Requests
    const { count: reqCount } = await supabase
      .from("friend_requests")
      .select("*", {count: "exact", head: true})
      .eq("receiver_id", user.id)
      .eq("status", "pending")
    
    setFriendReqCount(reqCount ?? 0);

    // Count Number of Public Sessions
    const { count: sessionCount } = await supabase
      .from("study_sessions")
      .select("*", { count: "exact", head: true })
      .eq("is_announced", true);

    setPubSessCount(sessionCount ?? 0);

    // Match Data for Preview
    const { data: matchData } = await supabase.rpc("get_ranked_matches", {
      current_user_id: user.id,
      page_offset: 0, 
      page_limit: 4
    })

    setMatches(matchData ?? []);
  }

  useEffect(() => {
      loadDashboardData();
    }, []);

    const handleLogout = async () => {
      await supabase.auth.signOut();
      router.replace("/(auth)/login");
    }

    return(
      
      <LinearGradient
        colors={theme.gradients.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {/* Friend Requests */}
          <Pressable onPress={() => router.push('/requests')}>
            <LinearGradient
              colors={["#83bbe4", "#f6eff3"]}
              start={{ x:0, y:0 }}
              end={{ x:1, y: 1 }}
              style={[styles.hs_topCard]}
            >
              <Text style={styles.hs_title}>
                <Ionicons name="people-outline" size={22} /> Friend Requests
              </Text>
              <Text style={styles.hs_number}>{friendReqCount}</Text>
              <Text style={{color: "#191970"}}>Pending Requests</Text>
            </LinearGradient>
          </Pressable>

          {/* Public Sessions */}
          <Pressable onPress={() => router.push('/announcement')}>
            <LinearGradient
              colors={["#67b3e9", "#f6eff3"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.hs_card]}
            >
              <Text style={styles.hs_title}>
                <Ionicons name="megaphone" size={24} color="#504cca"/> Public Sessions
              </Text>
              <Text style={styles.hs_number}>{publicSessionCount}</Text>
              <Text style={{color: "#191970"}}>Available Sessions</Text>
            </LinearGradient>
          </Pressable>
        
        {/* Matches Preview - Only show if there are matches */}
        <Pressable onPress={() => router.push("/matching")}>
          <LinearGradient
            colors={["#75bef3", "#f6eff3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.hs_card]}
          >
            <Text style={styles.hs_title}>
              <Ionicons name="flame" size={24} color="#d66b1e"/> Top Matches
            </Text>
          {matches.map((match, i) => (
            <View key={match.id} style={[styles.hs_matchRow, i === 3 && styles.hs_fade]}
            >
              <Text style={styles.hs_matchName}>{match.first_name} {match.last_name}</Text>
              <Text style={styles.hs_matchMajor}>{match.major}</Text>
            </View>
          ))}
        </LinearGradient>
        </Pressable>


        <View style={{ marginTop: 10 }}>
                <Pressable onPress={handleLogout}>
                    <LinearGradient
                        colors={theme.gradients.loginButton}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.loginButton}
                    >    
                        <Text style={styles.loginButtonText}>Log Out</Text>
                    </LinearGradient>
                </Pressable>
            </View>

      </ScrollView>
    </LinearGradient>
  )
}


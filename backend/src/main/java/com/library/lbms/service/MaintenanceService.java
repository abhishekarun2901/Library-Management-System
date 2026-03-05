package com.library.lbms.service;

public interface MaintenanceService {
     
    void runDailyMaintenance();
    void processOverdueFines();
    void expireReservations(); 
    void blacklistLongOverdueUsers();
}
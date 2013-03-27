<?php

/**
 * Simple WebApp to Start/Stop instances
 */
require_once 'aws-sdk-for-php/sdk.class.php';

// Set these to your AWS credentials
// ** I recommend creating a user with a group policy that 
// ** only has access to ec2 describe status, stopping and starting
$credentials = array(
    'key'     => '',
    'secret'  => '',
    );

// Read in config file
$configFile = 'conf.json';

$config = null;

try{ 

  if (!file_exists($configFile)) {
    throw new Exception('Config file is missing');
  }

  $config = json_decode( file_get_contents($configFile), true );

  if (empty($config) || empty($config['instances'  ])) {
    throw new Exception('The conf.json is incomplete');
  }

  if (empty($credentials['key']) || empty($credentials['secret'])) {
    throw new Exception('The AWS credentials are not set');
  }

} catch (Exception $e) {
  error("There was an error: ".$e->getMessage());
}

$ec2 = new AmazonEC2($credentials);

// Set region
if( isset($config['region']) ) {
  $ec2->set_region($config['region']);
}

// Handle input actions
$successMessage = '';
if (isset($_GET['action'])) {

  if (empty($_GET['instance']) || empty($config['instances'][$_GET['instance']])) {
    error('Invalid/Missing instance');
  }

  $instance = $config['instances'][$_GET['instance']];

  switch($_GET['action']) {

    case 'start':
      $ec2->start_instances($instance);
      $successMessage = 'Instance '.$_GET['instance'].' is starting';
      break;
    case 'stop':
      $ec2->stop_instances($instance);
      $successMessage = 'Instance '.$_GET['instance'].' is stopping';
      break;
    default: 
      error('Invalid action');
  }
}

// Get statuses of instances
$statuses = array();
try {
  $ec2Resp = $ec2->describe_instance_status();

  if ($ec2Resp->status != 200) {
    throw new Exception('ec2 Request Failed - Status: '.$ec2Resp->status
      ' - ' . $ec2Resp->body->Errors->Error->Message
      );
  }

  $instanceMap = array_flip($config['instances']);
  foreach( $ec2Resp->body->instanceStatusSet->item as $instance ) {
    if ($instanceMap[$instance->instanceId->to_string()]) {
      $statuses[ $instanceMap[$instance->instanceId->to_string()] ] 
        = $instance->instanceState->name->to_string();
    }
  }

  // Sort the statuses by name
  ksort($statuses);

  // Build array for output
  $statusOutput = array();
  foreach( $statuses as $name => $status ) {
    $statusOutput[] = array(
      'name'    => $name,
      'status'  => $status,
      );
  }

  // Output statuses
  json(true, $successMessage, $statusOutput);

} catch (Exception $e) {
  error($e->getMessage());
}

/**
 * Output functions
 */
function json($success, $message='', $data=null) {
  
  header('Content-Type: application/json');
  die( json_encode( array( 
    'success' => $success,
    'message' => $message,
    'data'    => $data
    )));
}

function error($message) {
  json(false, $message);
}

?>

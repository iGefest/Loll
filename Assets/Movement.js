public var mainCam : GameObject;
public var camRot : MouseLook;
public var animObj : GameObject;


public var moveSpeed : float = 4;
public var runSpeed : float = 8;
public var ledgeSpeed : float = 2;
public var ziplineAcceleration : float = 0.2;
public var ziplineSpeed : float = 15;
public var jumpSpeed : float = 9;
public var gravity : float = 25;

public var ledgeOffset : Vector3 = Vector3(0.0f, -1f, -0.4f);
public var climbPos : Vector3 = Vector3(0.0f, 1.1f, 0.4f);
public var vaultPos : Vector3 = Vector3(0.0f, 1f, 2f);
public var monkeyPos : Vector3 = Vector3(0.0f, -0.7f, 0f);

private var grounded : boolean;
private var canVault : boolean = false;
private var vaulting : boolean = false;
private var climbing : boolean = false;
private var hanging : boolean = false;
private var monkey : boolean = false;
private var ziplining : boolean = false;
private var running : boolean = false;

private var originalSpeed : float;
private var curZiplineSpeed : float;
private var timer : float;
private var hitCeiling : boolean = false;
private var ledge : Collider;
private var obstical : Collider;
private var rail : Collider;
private var zipline : Collider;
private var moveDirection = Vector3.zero;
private var controller : CharacterController;
controller = GetComponent(CharacterController);

function Awake()
{
	animObj.GetComponent.<Animation>().wrapMode = WrapMode.Loop;
}

function Start()
{
	originalSpeed = moveSpeed;
}

function Update()
{
	if(grounded)
	{
		moveDirection = new Vector3(Input.GetAxis("Horizontal"), 0, Input.GetAxis("Vertical"));
		moveDirection = transform.TransformDirection(moveDirection);
		moveDirection *= moveSpeed;
		if(Input.GetKeyDown(KeyCode.Space))
		{
			Jump();
		}
		if(Input.GetKey(KeyCode.LeftShift) && (Input.GetAxis("Horizontal") || Input.GetAxis("Vertical")))
		{
			Run();
		}
		else
		{
			running = false;
			moveSpeed = originalSpeed;
		}
		if(controller.velocity.magnitude > (moveSpeed - 1) && controller.velocity.magnitude < (runSpeed - 1))
		{
			animObj.GetComponent.<Animation>().CrossFade("Walk");
		}
		else if(controller.velocity.magnitude > (runSpeed - 1))
		{
			animObj.GetComponent.<Animation>().CrossFade("Run");
		}
		else
		{
			animObj.GetComponent.<Animation>().CrossFade("Idle");
		}
		if(canVault && obstical)
		{
			if(Input.GetKey("e") || controller.velocity.magnitude > runSpeed - 1)
			{
				vaulting = true;
			}
		}
	}
	else if(hanging)
	{
		LedgeGrab();
		if(Input.GetKeyDown(KeyCode.Space) && !climbing)
		{
			hanging = false;
			ledge = null;
			(GetComponent("MouseLook") as MouseLook).enabled = true;
		}
		if(Input.GetKey("w"))
		{
			timer += Time.deltaTime;
		}
		else
		{
			timer = 0;
		}
		if(timer >= 0.5)
		{
			climbing = true;
		}
		
	}
	else if(vaulting)
	{
		Vault();
	}
	else if(monkey)
	{
		Monkey();
	}
	else if(ziplining)
	{
		Zipline();
	}
	else
	{
		moveSpeed = originalSpeed;
		ledge = null;
		animObj.GetComponent.<Animation>().CrossFade("Idle");
		timer = 0;
	}
	if(hitCeiling)
	{
		moveDirection.y -= gravity * Time.deltaTime;
	}
	if(!vaulting && !hanging && !monkey && !ziplining)
	{
		moveDirection.y -= gravity * Time.deltaTime;
	}
	var flags = controller.Move(moveDirection * Time.deltaTime);
	hitCeiling = ((flags & CollisionFlags.CollidedAbove) != 0);
	grounded = ((flags & CollisionFlags.CollidedBelow) != 0);
}

function Run()
{
	moveSpeed = runSpeed;
	running = true;
}

function Jump()
{
	moveDirection.y = jumpSpeed;
}

function LedgeGrab()
{
	(GetComponent("MouseLook") as MouseLook).enabled = false;
	
	var localPos : Vector3 = ledge.transform.InverseTransformPoint(transform.position);
	var offsetPos : Vector3;
	var climbSpeed : float;
	if(!climbing)
	{
		offsetPos = ledge.transform.position + ledge.transform.TransformDirection(ledgeOffset);
		climbSpeed = 0.3f;
	}
	else
	{
		offsetPos = ledge.transform.position + ledge.transform.TransformDirection(climbPos);
		climbSpeed = 0.08f;
		FinishClimb();
	}
	var localOffsetPos : Vector3 = ledge.transform.InverseTransformPoint(offsetPos);
	localOffsetPos.x = localPos.x;
	offsetPos = ledge.transform.TransformPoint(localOffsetPos);
	transform.position = Vector3.Slerp(transform.position, offsetPos, climbSpeed);
	
	transform.rotation = Quaternion.Slerp(transform.rotation, ledge.transform.rotation, 0.3f);
	
	moveDirection = new Vector3(Input.GetAxis("Horizontal"), 0, 0);
	moveDirection = transform.TransformDirection(moveDirection);
	moveDirection *= ledgeSpeed;
	
	if(Input.GetAxis("Horizontal") > 0.0)
	{
		animObj.GetComponent.<Animation>().CrossFade("StrafeLeft");
	}
	else if(Input.GetAxis("Horizontal") < 0.0)
	{
		animObj.GetComponent.<Animation>().CrossFade("StrafeRight");
	}
	else
	{
		animObj.GetComponent.<Animation>().CrossFade("Hang");
	}
}

function FinishClimb()
{
	(GetComponent("MouseLook") as MouseLook).enabled = true;
	animObj.GetComponent.<Animation>().Play("Climb");
	mainCam.GetComponent.<Animation>().Play("CamVault");
	yield WaitForSeconds(1);
	animObj.GetComponent.<Animation>().Play("Idle");
	ledge = null;
	hanging = false;
	climbing = false;
}

function Vault()
{
	moveDirection = Vector3(0, 0, 0);
	var localPos : Vector3 = obstical.transform.InverseTransformPoint(transform.position);
	var offsetPos : Vector3 = obstical.transform.position + obstical.transform.TransformDirection(vaultPos);
	var localOffsetPos : Vector3 = obstical.transform.InverseTransformPoint(offsetPos);
	localOffsetPos.x = localPos.x;
	offsetPos = obstical.transform.TransformPoint(localOffsetPos);
	transform.position = Vector3.Slerp(transform.position, offsetPos, 0.05f);
	
	transform.rotation = Quaternion.Slerp(transform.rotation, obstical.transform.rotation, 0.1f);
	
	mainCam.GetComponent.<Animation>().Play("CamVault");
	animObj.GetComponent.<Animation>().CrossFade("Vault");
	yield WaitForSeconds(1);
	vaulting = false;
	obstical = null;
	animObj.GetComponent.<Animation>().Play("Idle");
}

function Monkey()
{
	(GetComponent("MouseLook") as MouseLook).enabled = false;
	
	var localPos : Vector3 = rail.transform.InverseTransformPoint(transform.position);
	var offsetPos : Vector3 = rail.transform.position + rail.transform.TransformDirection(monkeyPos);;
	var localOffsetPos : Vector3 = rail.transform.InverseTransformPoint(offsetPos);
	localOffsetPos.z = localPos.z;
	offsetPos = rail.transform.TransformPoint(localOffsetPos);
	transform.position = Vector3.Slerp(transform.position, offsetPos, 1f);
	var monkeyRotation : Quaternion;
	if(Quaternion.Angle(transform.rotation, rail.transform.rotation) < 90)
	{
		monkeyRotation = rail.transform.rotation;
	}
	else
	{
		monkeyRotation = Quaternion.Euler(transform.rotation.x, rail.transform.rotation.y - 180, transform.rotation.z);
	}
	
	transform.rotation = Quaternion.Slerp(transform.rotation, monkeyRotation, 0.3f);
	
	moveDirection = new Vector3(0, 0, Input.GetAxis("Vertical"));
	moveDirection = transform.TransformDirection(moveDirection);
	moveDirection *= ledgeSpeed;
	
	if(Input.GetAxis("Vertical") > 0.0)
	{
		animObj.GetComponent.<Animation>().CrossFade("MonkeyForward");
	}
	else if(Input.GetAxis("Vertical") < 0.0)
	{
		animObj.GetComponent.<Animation>().CrossFade("MonkeyBackward");
	}
	else
	{
		animObj.GetComponent.<Animation>().CrossFade("MonkeyHang");
	}
	
	if(Input.GetKeyDown(KeyCode.Space))
	{
		rail = null;
		monkey = false;
	}
}

function Zipline()
{
	(GetComponent("MouseLook") as MouseLook).enabled = false;
	var localPos : Vector3 = zipline.transform.InverseTransformPoint(transform.position);
	var offsetPos : Vector3 = zipline.transform.position + zipline.transform.TransformDirection(monkeyPos);;
	var localOffsetPos : Vector3 = zipline.transform.InverseTransformPoint(offsetPos);
	localOffsetPos.z = localPos.z;
	offsetPos = zipline.transform.TransformPoint(localOffsetPos);
	transform.position = Vector3.Slerp(transform.position, offsetPos, 1f);
	var monkeyRotation : Quaternion;
	
	var newRotation = Quaternion.Euler(transform.rotation.x, zipline.transform.rotation.y, transform.rotation.z);
	transform.rotation = Quaternion.Slerp(transform.rotation, newRotation, 0.3f);

	animObj.GetComponent.<Animation>().CrossFade("MonkeyHang");
	
	if(curZiplineSpeed < ziplineSpeed) 
    {
       	curZiplineSpeed += ziplineAcceleration;
	}
	
	transform.position += zipline.transform.forward * curZiplineSpeed * Time.deltaTime;
	
	if(Input.GetKeyDown(KeyCode.Space))
	{
		zipline = null;
		ziplining = false;
		curZiplineSpeed = 0;
	}
}

function OnControllerColliderHit(Hit : ControllerColliderHit)
{
	if(!controller.isGrounded && controller.velocity.y < -2)
	{
		mainCam.GetComponent.<Animation>().CrossFadeQueued("Impact", 0.3, QueueMode.PlayNow);
	}
}

function OnTriggerEnter(col : Collider)
{
	if(col.gameObject.tag == "Ledge" && !hanging)
	{
		ledge = col;
		hanging = true;
	}
	if(col.gameObject.tag == "Vault" && !vaulting)
	{
		obstical = col;
		canVault = true;
	}
	if(col.gameObject.tag == "Rail" && !monkey)
	{
		rail = col;
		monkey = true;
	}
	if(col.gameObject.tag == "Zipline" && !ziplining)
	{
		zipline = col;
		ziplining = true;
	}
}

function OnTriggerStay(col : Collider)
{
	if(col.gameObject.tag == "Vault" && !vaulting)
	{
		obstical = col;
		canVault = true;
	}
}

function OnTriggerExit()
{
	if(!climbing)
	{
		ledge = null;
		hanging = false;
	}
	canVault = false;
	monkey = false;
	ziplining = false;
	curZiplineSpeed = 0;
	(GetComponent("MouseLook") as MouseLook).enabled = true;
}

function OnGUI()
{
	if(!vaulting && canVault && obstical)
	{
		GUI.Label(Rect(Screen.width/2 - 50, Screen.height - 25, 100, 50), "Press E to vault");
	}
	if(hanging)
	{
		GUI.Label(Rect(Screen.width/2 - 60, Screen.height - 35, 120, 50), "Press space to drop" + " Press W to climb");
	}
	if(monkey)
	{
		GUI.Label(Rect(Screen.width/2 - 60, Screen.height - 35, 120, 50), "Press space to drop");
	}
	if(ziplining)
	{
		GUI.Label(Rect(Screen.width/2 - 60, Screen.height - 35, 120, 50), "Press space to drop");
	}
}